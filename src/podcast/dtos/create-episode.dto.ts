import { Field, InputType, PickType } from '@nestjs/graphql';
import { Episode } from '../entities/episode.entity';
@InputType()
export class CreateEpisodeDto extends PickType(Episode, ["title", "category"]) {
  @Field(returns => Number)
  podcastId: number
}
