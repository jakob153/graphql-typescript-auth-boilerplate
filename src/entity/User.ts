import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { IsEmail, Length } from 'class-validator';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  @Length(3)
  username: string;

  @Field()
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Field()
  authToken: string;

  @Column()
  @Length(6)
  password: string;

  @Column({ default: false })
  verified: boolean;
}
