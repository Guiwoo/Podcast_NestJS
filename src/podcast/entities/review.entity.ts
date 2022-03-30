import { Field, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { CoreEntity } from "./core.entity";
import { Podcast } from "./podcast.entity";

@Entity()
@ObjectType()
export class Review extends CoreEntity {

    @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
    @Field(type => User)
    user: User

    @Column()
    @Field(type => String)
    @IsString()
    review: string;

    @ManyToOne(() => Podcast, (p) => p.reviews, { onDelete: "CASCADE" })
    @Field(type => Podcast)
    podcast: Podcast
}