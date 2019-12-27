import { gql } from 'apollo-boost';

export const LOGIN_MUTATION = gql`
  mutation login($input: AuthInput!) {
    login(input: $input) {
      user {
        id
        email
      }
      errors {
        path
        message
      }
    }
  }
`;
