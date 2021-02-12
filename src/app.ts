import express from 'express';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createConnection, getConnectionOptions } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import { redis } from './redis';

import { AuthResolver } from './resolvers/AuthResolver';
import { BookResolver } from './resolvers/BookResolver';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const corsOptions =
  process.env.NODE_ENV === 'development'
    ? { credentials: true, origin: process.env.FRONTEND }
    : { credentials: true };

(async () => {
  const app = express();
  const redisStore = connectRedis(session);
  const maxMonthOfSession = 60;

  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());
  app.use(
    session({
      store: new redisStore({ client: redis }),
      secret: 'test',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: true,
        maxAge: maxMonthOfSession * 24 * 60 * 60 * 1000,
      },
      resave: false,
      saveUninitialized: false,
    })
  );

  const dbOptions = await getConnectionOptions(process.env.NODE_ENV);

  await createConnection({ ...dbOptions, name: 'default' });

  const port = process.env.PORT || 4000;

  const schema = await buildSchema({
    resolvers: [AuthResolver, BookResolver],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
    debug: false,
  });

  apolloServer.applyMiddleware({
    app,
    cors: corsOptions,
  });

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`server started at http://localhost:${port}/graphql`);
  });
})();
