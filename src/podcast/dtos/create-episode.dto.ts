import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CommonOutput } from 'src/core/dto/common.dto';
import { Episode } from '../entities/episode.entity';

@InputType()
export class CreateEpisodeInput extends PickType(
  Episode,
  ['title', 'category'],
  InputType,
) {
  @Field(type => Int)
  @IsInt()
  podcastId: number;
}

@ObjectType()
export class CreateEpisodeOutput extends CommonOutput {
  @Field(type => Int, { nullable: true })
  id?: number;
}
