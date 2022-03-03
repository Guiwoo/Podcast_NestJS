import { Episode } from './episode.entity';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumber } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { CoreEntity } from 'src/core/entities/core.entity';

@InputType("PodcastInputype", { isAbstract: true })
@ObjectType()
@Entity()
export class Podcast extends CoreEntity {

  @Field((_) => String)
  @Column()
  @IsString()
  title: string;

  @Field((_) => String)
  @Column()
  @IsString()
  category: string;

  @Field((_) => Number, { defaultValue: 0 })
  @Column({ default: 0 })
  @IsNumber()
  rating: number;

  @Field((_) => [Episode])
  @OneToMany(() => Episode, episode => episode.podcast)
  episodes: Episode[];
}
