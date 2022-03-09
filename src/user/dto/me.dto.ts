import { Field, ObjectType } from "@nestjs/graphql";
import { CommonOutput } from "src/core/dto/common.dto";
import { User } from "../entities/user.entity";

@ObjectType()
export class MeOutput extends CommonOutput {
    @Field(types => User, { nullable: true })
    user?: User
}