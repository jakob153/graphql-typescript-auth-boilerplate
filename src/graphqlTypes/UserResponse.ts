import { ObjectType, Field } from 'type-graphql';
import { User } from '../entity/User';

interface UserResponseData {
  username: string;
  email: string;
  authToken: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => User, { nullable: true })
  user: UserResponseData;
}
