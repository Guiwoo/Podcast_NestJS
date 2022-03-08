import { Field, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity()
export class CoreEntity {
    @Field(types => Number)
    @PrimaryGeneratedColumn()
    id: number

    @Field(types => Date)
    @CreateDateColumn()
    createdAt: Date

    @Field(types => Date)
    @UpdateDateColumn()
    UpdatedAt: Date
}