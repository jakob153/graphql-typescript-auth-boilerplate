import { gql } from 'apollo-boost';

export const REGISTER_MUTATION = gql`
  mutation register($input: AuthInput!) {
    register(input: $input) {
      errors {
        path
        message
      }
      success
    }
  }
`;
