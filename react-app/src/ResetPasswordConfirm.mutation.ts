import { gql } from 'apollo-boost';

export const RESET_PASSWORD_CONFIRM_MUTATION = gql`
  mutation resetPasswordConfirm($oldPassword: String!, $newPassword: String!) {
    resetPasswordConfirm(oldPassword: $oldPassword, newPassword: $newPassword) {
      success
      errors {
        message
        path
      }
    }
  }
`;
