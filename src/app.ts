import express from 'express';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import { redis } from './redis';

import { User } from './entities/User';

import { AuthResolver } from './resolvers/AuthResolver';
import { BookResolver } from './resolvers/BookResolver';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export const DI = {} as {
  orm: MikroORM;
  em: EntityManager;
  userRepository: EntityRepository<User>;
};

(async () => {
  const app = express();
  const redisStore = connectRedis(session);
  const maxDaysOfSession = 60;

  app.use(cookieParser());
  app.use(express.json());
  app.use(
    session({
      store: new redisStore({ client: redis }),
      secret: 'test',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: true,
        maxAge: maxDaysOfSession * 24 * 60 * 60 * 1000,
      },
      resave: false,
      saveUninitialized: false,
    })
  );

  DI.orm = await MikroORM.init({
    entities: ['./dist/entities/**/*.js'],
    entitiesTs: ['./src/entities/**/*.ts'],
    dbName: process.env.NODE_ENV,
    type: 'sqlite',
    debug: true,
  });
  DI.userRepository = DI.orm.em.getRepository(User);
  DI.em = DI.orm.em;

  const generator = DI.orm.getSchemaGenerator();
  await generator.updateSchema();

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

  const corsOptions =
    process.env.NODE_ENV === 'development'
      ? { credentials: true, origin: process.env.FRONTEND }
      : { credentials: true };

  apolloServer.applyMiddleware({
    app,
    cors: corsOptions,
  });

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`server started at http://localhost:${port}/graphql`);
  });
})();
