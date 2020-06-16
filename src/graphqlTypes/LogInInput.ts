import { InputType, Field } from 'type-graphql';

@InputType()
export class LogInInput {
  @Field()
  usernameOrEmail: string;

  @Field()
  password: string;
}
