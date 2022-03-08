import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/core/dto/common.dto';
import { Podcast } from '../entities/podcast.entity';

@InputType()
export class CreatePodcastInput extends PickType(
  Podcast,
  ['title', 'category'],
  InputType,
) { }

@ObjectType()
export class CreatePodcastOutput extends CommonOutput {
  @Field(type => Int, { nullable: true })
  id?: number;
}
