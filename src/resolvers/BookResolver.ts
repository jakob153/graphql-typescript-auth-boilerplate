import { Query, Resolver, UseMiddleware } from 'type-graphql';
import { verifySession } from '../middlewares/verifySession';

@Resolver()
export class BookResolver {
  @Query(() => String)
  @UseMiddleware(verifySession)
  book() {
    return 'The Republic';
  }
}
