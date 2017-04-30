import { graphqlWs } from 'graphql-server-ws';
import { Server as WsServer } from 'ws'
import { graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import * as graphqlRxJs from 'graphql-rxjs';
import express from 'express';
import url from 'url';
import defaultQuery from './defaultQuery';
import { typeDefs, resolvers, clockSource, Cookies } from './schema';

const WS_PORT = '3002';
const GRAPHQL_ENDPOINT = '/graphql';

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
graphqlRxJs.addReactiveDirectivesToSchema(schema);

const server = app.listen(WS_PORT, () => {
  console.log(`listening on port ${WS_PORT}`);

  const wss = new WsServer({ server: server });
  wss.on("connection", graphqlWs((ws) => {
    // The user can basically use any information he pleases too from ws connection object.
    const location = url.parse(ws.upgradeReq.url, true);

    // Multiplex ws connections by path.
    switch ( location.pathname ) {
     case GRAPHQL_ENDPOINT: // Same path graphiql is pointed to
       console.log('running the endpoint');
       return {
           context: { 
             clockSource, 
             Cookies 
           },
           schema,
           executor: graphqlRxJs,
           keepAlive: 5000,
       };
     default:
       ws.terminate();
       return undefined;
    }
  }));
});
