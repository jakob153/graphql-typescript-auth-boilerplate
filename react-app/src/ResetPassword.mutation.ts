import { gql } from 'apollo-boost';

export const RESET_PASSWORD_MUTATION = gql`
  mutation resetPassword($email: String!) {
    resetPassword(email: $email) {
      success
    }
  }
`;
