import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Episode } from './episode.entity';

@InputType("PodcastInpuType", { isAbstract: true })
@ObjectType()
export class Podcast {
  @Field(type => Number)
  id: number;

  @Field(type => String)
  title: string;

  @Field(type => String)
  category: string;

  @Field(type => String)
  rating: number;

  @Field(type => [Episode])
  episodes: Episode[];
}