import React, { FC, useState, ComponentType } from 'react';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch,
  RouteComponentProps,
  RouteProps
} from 'react-router-dom';
import qs from 'qs';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { CssBaseline, MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';

import Dashboard from './Dashboard';
import Main from './Main';
import ResetPassword from './ResetPassword';
import ResetPasswordConfirm from './ResetPasswordConfirm';

import { UserContext } from './UserContext';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: blue,
    secondary: blue
  }
});

export const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_API,
  credentials: 'include'
});

interface PrivateRouteProps extends RouteProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<RouteComponentProps<any>> | ComponentType<any>;
  condition: boolean;
}

const App: FC = () => {
  const [user, setUser] = useState({ loggedIn: false, email: '' });
  const params = qs.parse(window.location.search, { ignoreQueryPrefix: true });

  const PrivateRoute: FC<PrivateRouteProps> = ({ component: Component, condition, ...rest }) => (
    <Route
      {...rest}
      render={props => (condition ? <Component {...props} /> : <Redirect to="/" />)}
    />
  );

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <UserContext.Provider value={{ user, setUser }}>
            <Switch>
              <Route exact path="/" component={Main} />
              <Route exact path="/resetPassword" component={ResetPassword} />
              <PrivateRoute
                exact
                path="/dashboard"
                condition={user.loggedIn}
                component={Dashboard}
              />
              <PrivateRoute
                exact
                path="/resetPasswordConfirm"
                condition={!!params?.emailToken}
                component={ResetPasswordConfirm}
              />
              <Redirect to="/" />
            </Switch>
          </UserContext.Provider>
        </MuiThemeProvider>
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default App;
