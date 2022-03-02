import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';

@InputType()
export class UpdatePodcastInput extends PartialType(OmitType(Podcast, ["episodes"])) {
  @Field(type => Number)
  id: number
}