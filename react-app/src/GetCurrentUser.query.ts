import { gql } from 'apollo-boost';

export const GET_CURRENT_USER_QUERY = gql`
  query getCurrentUser {
    getCurrentUser {
      user {
        email
      }
    }
  }
`;
