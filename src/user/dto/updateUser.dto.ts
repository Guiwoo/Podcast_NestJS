import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CommonOutput } from "src/core/dto/common.dto";
import { User } from "../entities/user.entity";

@InputType()
export class UpdateUserInput extends PartialType(PickType(User, ["email", "password"])) { }

@ObjectType()
export class UpdateUserOutput extends CommonOutput { }
