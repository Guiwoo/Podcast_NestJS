import { Module } from '@nestjs/common';
import { PodcastsService } from './podcasts.service';
import { EpisodeResolver, ListnerResolver, PodcastsResolver } from './podcasts.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Podcast } from './entities/podcast.entity';
import { Episode } from './entities/episode.entity';
import { User } from 'src/users/entities/user.entity';
import { Review } from './entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Podcast, Episode, Review, User])],
  providers: [PodcastsService, PodcastsResolver, EpisodeResolver, ListnerResolver],
})
export class PodcastsModule { }
