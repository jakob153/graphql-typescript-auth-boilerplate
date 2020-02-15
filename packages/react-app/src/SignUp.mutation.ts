import { gql } from 'apollo-boost';

export const SIGNUP_MUTATION = gql`
  mutation register($input: AuthInput!) {
    register(input: $input) {
      success
    }
  }
`;
