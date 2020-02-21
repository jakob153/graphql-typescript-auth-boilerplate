import { gql } from 'apollo-boost';

export const LOGIN_MUTATION = gql`
  mutation logIn($input: AuthInput!) {
    logIn(input: $input) {
      user {
        email
      }
    }
  }
`;
