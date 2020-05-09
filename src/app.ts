require('dotenv').config({
  path: `./.env.${process.env.NODE_ENV}`,
});

import express from 'express';
import cookieParser from 'cookie-parser';
import { createConnection, getConnectionOptions } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import { AuthResolver } from './resolvers/AuthResolver';
import { BookResolver } from './resolvers/BookResolver';

import { confirmAccount } from './rest/confirmAccount';
import { refreshToken } from './rest/refreshToken';
import { generateEmailToken } from './rest/generateEmailToken';

(async () => {
  const app = express();

  app.use(cookieParser());

  app.get('/confirmAccount', confirmAccount);
  app.get('/refreshToken', refreshToken);
  app.get('/generateEmailToken', generateEmailToken);

  try {
    const dbOptions = await getConnectionOptions(process.env.NODE_ENV);

    await createConnection({ ...dbOptions, name: 'default' });

    const port = process.env.PORT || 4000;

    const schema = await buildSchema({ resolvers: [AuthResolver, BookResolver], validate: false });

    const apolloServer = new ApolloServer({
      schema,
      context: ({ req, res }) => ({ req, res }),
      debug: false,
    });

    apolloServer.applyMiddleware({
      app,
      cors: { credentials: true, origin: process.env.REACT_APP },
    });

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`server started at http://localhost:${port}/graphql`);
    });
  } catch (error) {
    console.error(error);
  }
})();
