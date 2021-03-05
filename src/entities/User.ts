import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { IsEmail, Length } from 'class-validator';

@ObjectType()
@Entity()
export class User {
  constructor(username: string, email: string, password: string) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  @PrimaryKey()
  id: number;

  @Field()
  @Property({ unique: true })
  @Length(3)
  username: string;

  @Field()
  @Property({ unique: true })
  @IsEmail()
  email: string;

  @Property()
  @Length(6)
  password: string;

  @Property({ default: false })
  verified: boolean;
}
