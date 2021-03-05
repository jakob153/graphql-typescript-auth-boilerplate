import { ObjectType, Field } from 'type-graphql';
import { User } from '../entities/User';

interface UserResponseData {
  username: string;
  email: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => User, { nullable: true })
  user: UserResponseData;
}
