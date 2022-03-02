import { Field, ObjectType } from "@nestjs/graphql";
import { Episode } from "../entities/episode.entity";
import { CoreOutput } from "./common.dto";

@ObjectType()
export class EpisodesOutput extends CoreOutput {

    @Field(types => [Episode], { nullable: true })
    episodes?: Episode[]
}

@ObjectType()
export class EpisodeOutput extends CoreOutput {

    @Field(type => Episode, { nullable: true })
    episode?: Episode

}