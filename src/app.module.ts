import { Module } from '@nestjs/common';
import { PodcastModule } from './podcast/podcast.module';
@Module({
  imports: [PodcastModule],
})
export class AppModule {}
