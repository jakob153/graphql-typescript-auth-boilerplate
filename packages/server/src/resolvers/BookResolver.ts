import { Query, Resolver, UseMiddleware } from 'type-graphql';
import { verifyToken } from '../middlewares/verifyToken';

@Resolver()
export class BookResolver {
  @Query(() => String)
  @UseMiddleware(verifyToken)
  book(): string {
    return 'The Republic';
  }
}
