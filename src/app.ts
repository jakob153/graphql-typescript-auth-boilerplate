import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createConnection, getConnectionOptions } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import { AuthResolver } from './resolvers/AuthResolver';
import { BookResolver } from './resolvers/BookResolver';

import { confirmAccount } from './rest/confirmAccount';
import { refreshToken } from './rest/refreshToken';
import { resetPassword } from './rest/resetPassword';
import { resetPasswordConfirm } from './rest/resetPasswordConfirm';

(async () => {
  const app = express();
  const router = express.Router();

  router.get('/confirmAccount', confirmAccount);
  router.get('/refreshToken', refreshToken);
  router.get('/resetPassword/:emailToken/:userId', resetPassword);
  router.post(
    '/resetPassword/:emailToken/:userId/confirm',
    resetPasswordConfirm
  );

  app.use(cors({ origin: process.env.REACT_APP, credentials: true }));
  app.use(cookieParser());
  app.use('/rest', router);

  try {
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
      cors: { origin: process.env.REACT_APP, credentials: true },
    });

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`server started at http://localhost:${port}/graphql`);
    });
  } catch (error) {
    console.error(error);
  }
})();
