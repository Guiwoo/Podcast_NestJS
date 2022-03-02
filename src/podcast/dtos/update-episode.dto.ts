import { Field, InputType, OmitType, PartialType } from "@nestjs/graphql";
import { Episode } from "../entities/episode.entity";

@InputType()
export class UpdateEpisodeInput extends PartialType(OmitType(Episode, ["id"])) {
  @Field(types => Number)
  podcastId: number

  @Field(types => Number)
  episodeId: number

}