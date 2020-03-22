import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  emailToken: string;

  @Column({ unique: true })
  refreshToken: string;

  @Column()
  password: string;

  @Column({ default: false })
  verified: boolean;
}
