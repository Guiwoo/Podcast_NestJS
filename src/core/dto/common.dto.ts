import { Field, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString } from "class-validator";

@ObjectType()
export class CommonOutput {
    @Field(types => Boolean)
    @IsBoolean()
    ok: boolean

    @Field(types => String, { nullable: true })
    @IsString()
    @IsOptional()
    error?: string
}