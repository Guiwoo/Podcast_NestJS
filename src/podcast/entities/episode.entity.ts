import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { CoreEntity } from 'src/core/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Podcast } from './podcast.entity';

@InputType('EpisodeInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Episode extends CoreEntity {
  @Field(type => Podcast)
  @ManyToOne(() => Podcast, podcast => podcast.episodes)
  podcast: Podcast

  @Field((_) => String)
  @Column()
  title: string;

  @Field((_) => String)
  @Column()
  category: string;
}
