import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { Container } from '@material-ui/core';
import qs from 'qs';

import Alert from './Alert';
import Navbar from './Navbar';
import Dashboard from './Dashboard';

import { AlertState } from './interfaces/Alert';

// eslint-disable-next-line no-console
console.log(process.env.GRAPHQL_API);

export const client = new ApolloClient({
  uri: process.env.GRAPHQL_API
});

const App: FC = props => {
  const [alert, setAlert] = useState<AlertState>({ variant: 'info', messages: [], show: false });

  useEffect(() => {
    const params = qs.parse(window.location.href);
    if (params?.query) {
      setAlert({
        variant: params.accountConfirm ? 'success' : 'error',
        messages: [params.accountConfirm ? 'Account Confirmed! You can now log in.' : ''],
        show: true
      });
    }
  }, [props]);

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Navbar />
        <Container>
          {alert.show && <Alert variant={alert.variant} messages={alert.messages} />}
          <Switch>
            <Route exact path="/dashboard" component={Dashboard} />
          </Switch>
        </Container>
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
