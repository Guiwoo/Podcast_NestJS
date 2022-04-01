import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Podcast } from "../entities/podcast.entity";
import { CoreOutput } from "./output.dto";

@InputType()
export class SubscribePodcastInput {
    @Field(type => Number)
    podcastId: number
}

@ObjectType()
export class SubscribePodcastOutput extends CoreOutput { }

@ObjectType()
export class SeeSubCriptionsOutput extends CoreOutput {
    @Field(type => [Podcast], { nullable: true })
    podcasts?: Podcast[]
}