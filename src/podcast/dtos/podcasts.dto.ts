import { Field, ObjectType } from "@nestjs/graphql";
import { Podcast } from "../entities/podcast.entity";
import { CoreOutput } from "./common.dto";

@ObjectType()
export class PodcastsOutPut {
    @Field(() => [Podcast])
    podcasts: Podcast[];
}

@ObjectType()
export class PodcastOutput extends CoreOutput {

    @Field(type => Podcast, { nullable: true })
    podcast?: Podcast
}