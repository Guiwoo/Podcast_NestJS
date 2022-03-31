import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "./output.dto";

@InputType()
export class SubscribePodcastInput {
    @Field(type => Number)
    podcastId: number
}

@ObjectType()
export class SubscribePodcastOutput extends CoreOutput { }