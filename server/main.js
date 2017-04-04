import { graphqlWs } from 'graphql-server-ws';
import WebSocket from 'ws'
import { graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import * as graphqlRxJs from 'graphql-rxjs';
import express from 'express';
import url from 'url';
import defaultQuery from './defaultQuery';
import { typeDefs, resolvers, clockSource, Cookies } from './schema';

const GRAPHQL_ENDPOINT = '/graphql';

// express app for graphiql
const app = express();
app.use("/graphiql", graphiqlExpress({
    endpointURL: `ws://localhost:3000/websocket`,
		query: defaultQuery,
}));

// bind the express app to meteor webapp (http reqs handler)
WebApp.connectHandlers.use(app);

// Compose togather resolver and typeDefs.
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// new websocket connection to the original meteor websocket endpoint
const wss = new WebSocket("ws://localhost:3000/websocket");

// this callback is never triggered
// maybe we need to "speak DDP"?
wss.on("connection", graphqlWs((ws) => {
  // The user can basically use any information he pleases too from ws connection object.
  const location = url.parse(ws.upgradeReq.url, true);
  
  console.log(`location`, location);
  
  // Multiplex ws connections by path.
  switch ( location.pathname ) {
   
    case GRAPHQL_ENDPOINT: // Same path graphiql is pointed to
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
