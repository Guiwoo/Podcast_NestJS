import { Injectable } from '@nestjs/common';
import { CoreOutput } from './dtos/common.dto';
import { CreateEpisodeInput } from './dtos/create-episode.dto';
import { CreatePodcastInput, CreatePodcastOutput } from './dtos/create-podcast.dto';
import { EpisodeOutput, EpisodesOutput } from './dtos/episodes.dto';
import { PodcastOutput, PodcastsOutPut } from './dtos/podcasts.dto';
import { UpdateEpisodeInput } from './dtos/update-episode.dto';
import { UpdatePodcastInput } from './dtos/update-podcast.dto';
import { Episode } from './entities/episode.entity';
import { Podcast } from './entities/podcast.entity';

@Injectable()
export class PodcastsService {
  private podcasts: Podcast[] = [{ id: 0, title: "dummy", category: "test", rating: 5, episodes: [{ id: 0, title: "Dummy Episodes", category: "test", rating: 5 }] }];

  getAllPodcasts(): PodcastsOutPut {
    return {
      podcasts: this.podcasts
    }
  }

  createPodcast({
    title,
    category,
  }: CreatePodcastInput): CreatePodcastOutput {
    if (title === "" || category === "") {
      return {
        ok: false,
        error: "Please type title and category don't be empty"
      }
    }
    const newObj: Podcast = {
      id: this.podcasts.length,
      title: title,
      category: category,
      rating: 5,
      episodes: []
    }
    this.podcasts.push(newObj)
    return {
      ok: true
    }
  }

  getPodcast(id: number): PodcastOutput {
    if (+id > this.podcasts.length || id === this.podcasts.length) {
      return {
        ok: false,
        error: "This Podcast does not exsist Create First"
      }
    }
    const [foundPodcasts] = this.podcasts.filter((podcast) => podcast.id === +id);
    return {
      ok: true,
      podcast: foundPodcasts
    }
  }

  deletePodcast(id: number): CoreOutput {
    if (+id > this.podcasts.length || id === this.podcasts.length) {
      return {
        ok: false,
        error: "This Podcast does not exsist Create First"
      }
    }
    this.podcasts = this.podcasts.filter((p) => p.id !== +id);
    return {
      ok: true
    };
  }

  updatePodcast(input: UpdatePodcastInput): CoreOutput {
    if (+input.id > this.podcasts.length || +input.id === this.podcasts.length) {
      return {
        ok: false,
        error: "This Podcast does not exsist pleas check podcast first"
      }
    }
    console.log({ ...input })
    this.podcasts[input.id] = {
      ...this.podcasts[input.id],
      ...input
    }
    return {
      ok: true
    };
  }

  getEpisodes(
    podcastId: number,
  ): EpisodesOutput {
    if (+podcastId > this.podcasts.length || +podcastId === this.podcasts.length) {
      return {
        ok: false,
        error: "This Podcast does not exsist pleas check podcast first"
      }
    }
    return {
      ok: true,
      episodes: this.podcasts[+podcastId].episodes
    }
  }

  createEpisode(input: CreateEpisodeInput): CoreOutput {
    if (input.podcastId > this.podcasts.length || input.podcastId === this.podcasts.length) {
      return {
        ok: false,
        error: "This podcast does not exsist"
      }
    }
    const newObj: Episode = {
      id: this.podcasts[input.podcastId].episodes.length,
      title: input.title,
      category: input.category,
      rating: 5
    }
    this.podcasts[input.podcastId].episodes.push(newObj)
    console.log(this.podcasts[0].episodes)
    return {
      ok: true
    }
  }

  updateEpisode({ title, category, rating, episodeId, podcastId }: UpdateEpisodeInput): CoreOutput {
    if (podcastId > this.podcasts.length || podcastId === this.podcasts.length) {
      return {
        ok: false,
        error: "This Podcast does not exsist !"
      }
    }
    if (episodeId > this.podcasts[podcastId].episodes.length || episodeId === this.podcasts[podcastId].episodes.length) {
      return {
        ok: false,
        error: "This Episode does not exsist in podcast !"
      }
    }
    if (title === "" || category === "") {
      return {
        ok: false,
        error: "Can not Update to Black Please wirte letters"
      }
    }
    this.podcasts[podcastId].episodes[episodeId] = {
      id: episodeId,
      title: title || this.podcasts[podcastId].episodes[episodeId].title,
      category: category || this.podcasts[podcastId].episodes[episodeId].category,
      rating: this.podcasts[podcastId].episodes[episodeId].rating
    }
    console.log(this.podcasts[0].episodes)
    return {
      ok: true
    }
  }

  deleteEpisode(podcastId: number, episodeId: number): CoreOutput {
    if (podcastId > this.podcasts.length || podcastId === this.podcasts.length) {
      return {
        ok: false,
        error: "This Podcast does not exsist !"
      }
    }
    if (episodeId > this.podcasts[podcastId].episodes.length || episodeId === this.podcasts[podcastId].episodes.length) {
      return {
        ok: false,
        error: "This Episode does not exsist in Podcast !"
      }
    }
    this.podcasts[podcastId].episodes = this.podcasts[podcastId].episodes.filter((e) => e.id !== episodeId)
    console.log(this.podcasts[0].episodes)
    return {
      ok: true
    };
  }

  getEpisode(
    podcastId: number,
    episodeId: number,
  ): EpisodeOutput {
    if (podcastId > this.podcasts.length || podcastId === this.podcasts.length) {
      return {
        ok: false,
        error: "This Podcast does not exsist !"
      }
    }
    if (episodeId > this.podcasts[podcastId].episodes.length || episodeId === this.podcasts[podcastId].episodes.length) {
      return {
        ok: false,
        error: "This Episode does not exsist in Podcast !"
      }
    }
    const episode = this.podcasts[podcastId].episodes[episodeId]
    return {
      ok: false,
      episode
    }
  }
}
