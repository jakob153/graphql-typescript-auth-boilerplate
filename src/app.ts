import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createConnection, getConnectionOptions } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';

import { AuthResolver } from './resolvers/AuthResolver';
import { BookResolver } from './resolvers/BookResolver';

import { confirmAccount } from './rest/confirmAccount';
import { deleteRefreshToken, refreshToken } from './rest/refreshToken';
import { resetPassword } from './rest/resetPassword';
import { confirmResetPassword } from './rest/confirmResetPassword';

(async () => {
  const app = express();

  app.use(cors({ credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.get('/confirmAccount/:emailToken', confirmAccount);
  app.get('/refreshToken', refreshToken);
  app.delete('/refreshToken', deleteRefreshToken);

  app.get('/resetPassword/:resetPasswordToken', resetPassword);
  app.post('/resetPassword/:resetPasswordToken', confirmResetPassword);

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
      cors: { credentials: true },
    });

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`server started at http://localhost:${port}/graphql`);
    });
  } catch (error) {
    console.error(error);
  }
})();
