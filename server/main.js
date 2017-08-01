import { SubscriptionServer } from 'subscriptions-transport-ws';
import { graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import {
  executeReactive,
  subscribe,
  specifiedRules,
  prepareSchema,
} from 'graphql-rxjs';
import express from 'express';
import url from 'url';
import defaultQuery from './defaultQuery';
import { typeDefs, subscriptionMap, resolvers, Cookies } from './schema';
import { Subject } from 'rxjs';
import { addFiberToResolvers } from './hook';

const WS_PORT = '3002';
const GRAPHQL_ENDPOINT = '/graphql';
const LAST_COOKIE = new Subject();

const app = express();
app.use("/graphiql", graphiqlExpress({
    endpointURL: `ws://localhost:${WS_PORT}${GRAPHQL_ENDPOINT}`,
		query: defaultQuery,
}));

// Compose togather resolver and typeDefs.
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
addFiberToResolvers(schema);
prepareSchema(schema);

const server = app.listen(WS_PORT, () => {
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute: executeReactive,
      subscribe,
      // XXX: Need to make a better way for doing this.
      rootValue: subscriptionMap,
      validationRules: specifiedRules,
      onConnect: () => ({
        Cookies,
        lastCookie: LAST_COOKIE,
      }),
    },
    {
      server: server,
      path: '/graphql',
    }
  );

  console.log(`Websocket Server is now running on http://localhost:${WS_PORT}`);
});
