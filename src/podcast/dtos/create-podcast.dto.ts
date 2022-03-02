import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "./common.dto";

@InputType()
export class CreatePodcastInput {
  @Field(type => String)
  title: string

  @Field(type => String)
  category: string
}

@ObjectType()
export class CreatePodcastOutput extends CoreOutput { }