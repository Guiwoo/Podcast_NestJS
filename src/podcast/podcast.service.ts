import { Injectable } from '@nestjs/common';
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
import { Episode, Podcast } from './entities/podcast.entity';

@Injectable()
export class PodcastService {
  private podcasts: Podcast[] = [
    {
      id: 0,
      title: 'dummy',
      category: 'dummy',
      rating: 10,
      episodes: [
        {
          id: 0,
          title: 'dummy Episode',
          description: 'dummydummy',
        },
        {
          id: 1,
          title: 'Test Episode',
          description: 'Test Episode fr real',
        },
      ],
    },
  ];

  create(input: CreatePodcastInput): OkOutput {
    if (
      !input.title ||
      !input.episodes ||
      !input.category ||
      !input.rating ||
      !input.episodes
    ) {
      return {
        ok: false,
        error: 'Put All the information',
      };
    }
    const newEpisode: Episode[] = input.episodes.map((epi, index) => {
      return {
        id: index,
        ...epi,
      };
    });
    const newObj: Podcast = {
      id: this.podcasts.length,
      title: input.title,
      category: input.category,
      rating: input.rating,
      episodes: newEpisode,
    };
    this.podcasts.push(newObj);
    return {
      ok: true,
    };
  }

  findAll(): ResultOutput {
    return { result: this.podcasts };
  }

  findById(id: number): FindOutput {
    if (id > this.podcasts.length || id === this.podcasts.length) {
      return {
        ok: false,
        error: 'This array does not exsist',
      };
    }
    return {
      ok: true,
      result: this.podcasts[id],
    };
  }

  podcastsUpdateById(input: UpdateInput, id: number): OkOutput {
    if (id > this.podcasts.length || this.podcasts.length === id) {
      return {
        ok: false,
        error: 'This Podcast does not exsit',
      };
    }
    const updatedObj = {
      ...this.podcasts[id],
      ...input,
    };
    this.podcasts[id] = updatedObj;
    return {
      ok: true,
    };
  }

  podcastsDeleteById(id: number): OkOutput {
    console.log(id, this.podcasts.length);
    if (id === this.podcasts.length || id > this.podcasts.length) {
      return {
        ok: false,
        error: 'This Podcast does not exsit',
      };
    }
    this.podcasts = this.podcasts.filter((p) => p.id !== id);
    return {
      ok: true,
    };
  }

  episodesGet(id: number): ResultEpisodeOutput {
    if (id > this.podcasts.length || id === this.podcasts.length) {
    }
    const result = this.podcasts[id].episodes;
    return {
      ok: true,
      result,
    };
  }

  episodesCreate(input: EpisodeInput, id: number): OkOutput {
    if (id > this.podcasts.length || id === this.podcasts.length) {
      return {
        ok: false,
        error: `This podcast id:${id} does not exsits`,
      };
    }
    const newObj = {
      id: this.podcasts[id].episodes.length,
      ...input,
    };
    this.podcasts[id].episodes.push(newObj);
    return {
      ok: true,
    };
  }

  episodeUpdate(id: number, episodeId: number, input: UpdateEpisode): OkOutput {
    if (id > this.podcasts.length || id === this.podcasts.length) {
      return {
        ok: false,
        error: 'This Podcast does not exsits',
      };
    }
    if (
      (this.podcasts[id] && episodeId > this.podcasts[id].episodes.length) ||
      episodeId === this.podcasts[id].episodes.length
    ) {
      return {
        ok: false,
        error: 'This Episode does not exsists upload first',
      };
    }
    const updatedObj = {
      ...this.podcasts[id].episodes[episodeId],
      ...input,
    };
    this.podcasts[id].episodes[episodeId] = updatedObj;
    return {
      ok: true,
    };
  }

  episodeDelete(id: number, episodeId: number): OkOutput {
    if (id > this.podcasts.length || id === this.podcasts.length) {
      return {
        ok: false,
        error: 'This Podcast does not exsits',
      };
    }
    if (
      (this.podcasts[id] && episodeId > this.podcasts[id].episodes.length) ||
      episodeId === this.podcasts[id].episodes.length
    ) {
      return {
        ok: false,
        error: 'This Episode does not exsists upload first',
      };
    }
    const newEpisode = this.podcasts[id].episodes.filter(
      (epi) => epi.id !== episodeId,
    );
    this.podcasts[id].episodes = newEpisode;
    return {
      ok: true,
    };
  }
}
