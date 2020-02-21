import { gql } from 'apollo-boost';

export const SIGNUP_MUTATION = gql`
  mutation signUp($input: AuthInput!) {
    signUp(input: $input) {
      success
    }
  }
`;
