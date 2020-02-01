import express from 'express';
import { createConnection, getConnectionOptions } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cookieParser from 'cookie-parser';

import { AuthResolver } from './resolvers/AuthResolver';
import { confirmAccount } from './confirmAccount';
import { Context } from './types/Context';

require('dotenv').config({
  path: `./.env.${process.env.NODE_ENV}`
});

(async (): Promise<void> => {
  const app = express();
  app.use(cookieParser());
  app.get('/confirmAccount', confirmAccount);

  // get options from ormconfig.js
  const dbOptions = await getConnectionOptions(process.env.NODE_ENV || 'development');

  await createConnection({ ...dbOptions, name: 'default' });

  const port = process.env.PORT || 4000;

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [AuthResolver],
      validate: false
    }),
    context: ({ req, res }): Context => ({ req, res })
  });

  apolloServer.applyMiddleware({
    app,
    cors: { credentials: true, origin: process.env.FRONTEND }
  });

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`server started at http://localhost:${port}/graphql`);
  });
})();
