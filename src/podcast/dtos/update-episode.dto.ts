import { InputType, Field, PickType, PartialType } from '@nestjs/graphql';
import { Episode } from '../entities/episode.entity';

@InputType()
export class UpdateEpisodeDto extends PartialType(PickType(Episode, ["title", "category"])) {

  @Field(returns => Number)
  podcastId: number

  @Field(returns => Number)
  episodeId: number

}
