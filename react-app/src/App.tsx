import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import {
  Container,
  CssBaseline,
  MuiThemeProvider,
  createMuiTheme,
  makeStyles,
  Theme
} from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import qs from 'qs';

import Alert from './Alert';
import Navbar from './Navbar';
import Dashboard from './Dashboard';

import { AlertState } from './interfaces/Alert';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: blue,
    secondary: blue
  }
});

const useStyles = makeStyles((theme: Theme) => ({
  marginTop4: {
    marginTop: theme.spacing(4)
  }
}));

export const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_API,
  credentials: 'include'
});

const App: FC = props => {
  const [alert, setAlert] = useState<AlertState>({ variant: 'info', messages: [], show: false });
  const classes = useStyles();

  useEffect(() => {
    const params = qs.parse(window.location.search.replace('?', ''));
    if (Object.entries(params).length) {
      setAlert({
        variant: params.accountConfirm === 'true' ? 'success' : 'error',
        messages: [
          params.accountConfirm === 'true'
            ? 'Account Confirmed! You can now log in.'
            : 'Something went wrong.'
        ],
        show: true
      });
    }
  }, [props]);

  const handleAlertClose = () => setAlert(prevState => ({ ...prevState, show: false }));

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar />
          <Container>
            {alert.show && (
              <Alert
                className={classes.marginTop4}
                variant={alert.variant}
                messages={alert.messages}
                onClose={handleAlertClose}
              />
            )}
            <Switch>
              <Route exact path="/dashboard" component={Dashboard} />
            </Switch>
          </Container>
        </MuiThemeProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
