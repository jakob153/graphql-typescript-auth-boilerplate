import { ObjectType, Field } from 'type-graphql';
import { FieldError } from './FieldError';

@ObjectType()
export class MailResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean)
  success: boolean;
}
