import { Field, InputType, ObjectType, OmitType, PartialType } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';

@InputType({ isAbstract: true })
@ObjectType()
export class UpdatePodcastDto extends PartialType(OmitType(Podcast, ["id", "episodes"])) {
  @Field(returns => Number)
  id: number
}
