import { createContext, Dispatch, SetStateAction } from 'react';

interface User {
  loggedIn: boolean;
  email: string;
}

type SetUser = Dispatch<
  SetStateAction<{
    loggedIn: boolean;
    email: string;
  }>
>;

interface UserContext {
  user: User;
  setUser: SetUser;
}

export const UserContext = createContext({} as UserContext);
