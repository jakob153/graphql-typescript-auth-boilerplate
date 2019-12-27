import { gql } from 'apollo-boost';

export const PASSWORD_RESET_MUTATION = gql`
  mutation passwordReset($password: String) {
    passwordReset(password: $password) {
      success
      error {
        path
        message
      }
    }
  }
`;
