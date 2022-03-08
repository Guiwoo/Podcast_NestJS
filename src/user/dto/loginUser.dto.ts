import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { CommonOutput } from "src/core/dto/common.dto";
import { User } from "../entities/user.entity";

@InputType()
export class LoginInput extends PickType(User, ["email", "password"]) { }

@ObjectType()
export class LoginOutput extends CommonOutput {
    @Field(types => String, { nullable: true })
    @IsString()
    @IsOptional()
    token?: string
}