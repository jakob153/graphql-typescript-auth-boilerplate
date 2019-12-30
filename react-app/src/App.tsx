import React, { FC, useEffect, useState, ComponentType } from 'react';
import { BrowserRouter, Redirect, Route, Switch, RouteComponentProps } from 'react-router-dom';
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
import Dashboard from './Dashboard';
import Main from './Main';
import PasswordForget from './ResetPassword';

import { UserContext } from './UserContext';

import { GET_CURRENT_USER_QUERY } from './GetCurrentUser.query';

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

interface PrivateRouteProps {
  component: ComponentType<RouteComponentProps<any>> | ComponentType<any>;
  exact: boolean;
  path: string;
}

const App: FC = props => {
  const [alert, setAlert] = useState<AlertState>({ variant: 'info', messages: [], show: false });
  const [user, setUser] = useState({ loggedIn: false, email: '' });
  const classes = useStyles();

  const PrivateRoute: FC<PrivateRouteProps> = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={props => (user.loggedIn ? <Component {...props} /> : <Redirect to="/login" />)}
    />
  );

  const getCurrentUser = async () => {
    const response = await client.query({ query: GET_CURRENT_USER_QUERY });
    if (!response.data.getCurrentUser.user) {
      return;
    }
    setUser({ email: response.data.getCurrentUser.user.email, loggedIn: true });
  };

  useEffect(() => {
    getCurrentUser();
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
          <UserContext.Provider value={{ user, setUser }}>
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
                <Route exact path="/" component={Main} />
                <Route exact path="/passwordForget" component={PasswordForget} />
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
                <Redirect to="/" />
              </Switch>
            </Container>
          </UserContext.Provider>
        </MuiThemeProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
