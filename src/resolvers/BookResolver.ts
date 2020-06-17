import { Query, Resolver, UseMiddleware } from 'type-graphql';
import { verifyAuthToken } from '../middlewares/verifyAuthToken';

@Resolver()
export class BookResolver {
  @Query(() => String)
  @UseMiddleware(verifyAuthToken)
  book() {
    return 'The Republic';
  }
}
