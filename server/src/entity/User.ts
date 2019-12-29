import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text', { unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ default: false })
  verified: boolean;
}
