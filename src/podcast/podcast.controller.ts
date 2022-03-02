import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { identity } from 'rxjs';
import {
  CreatePodcastInput,
  EpisodeInput,
  FindOutput,
  OkOutput,
  ResultEpisodeOutput,
  ResultOutput,
  UpdateEpisode,
  UpdateInput,
} from './dto/podcast.dto';
import { PodcastService } from './podcast.service';

@Controller('podcasts')
export class PodcastController {
  constructor(private podcastService: PodcastService) {}

  @Get()
  podcastsGet(): ResultOutput {
    return this.podcastService.findAll();
  }

  @Post()
  podcastsPost(@Body() inputType: CreatePodcastInput): OkOutput {
    return this.podcastService.create(inputType);
  }

  @Get('/:id')
  podcastsById(@Param('id') id): FindOutput {
    return this.podcastService.findById(+id);
  }

  @Patch('/:id')
  podcastsUpdateById(
    @Body() inputType: UpdateInput,
    @Param('id') id,
  ): OkOutput {
    return this.podcastService.podcastsUpdateById(inputType, +id);
  }

  @Delete('/:id')
  podcastsDeleteById(@Param('id') id): OkOutput {
    return this.podcastService.podcastsDeleteById(+id);
  }

  @Get('/:id/episodes')
  episodesGet(@Param('id') id): ResultEpisodeOutput {
    return this.podcastService.episodesGet(+id);
  }

  @Post('/:id/episodes')
  episodeCreate(@Body() input: EpisodeInput, @Param('id') id): OkOutput {
    return this.podcastService.episodesCreate(input, +id);
  }

  @Patch('/:id/episodes/:episodeId')
  episodeUpdate(
    @Body() input: UpdateEpisode,
    @Param('id') id,
    @Param('episodeId') episodeId,
  ): OkOutput {
    return this.podcastService.episodeUpdate(+id, +episodeId, input);
  }

  @Delete('/:id/episodes/:episodeId')
  episodeDelete(@Param('id') id, @Param('episodeId') episodeId): OkOutput {
    return this.podcastService.episodeDelete(+id, +episodeId);
  }
}
