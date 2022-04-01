import { Injectable } from '@nestjs/common';
import {
  CreateEpisodeInput,
  CreateEpisodeOutput,
} from './dtos/create-episode.dto';
import {
  CreatePodcastInput,
  CreatePodcastOutput,
} from './dtos/create-podcast.dto';
import { UpdateEpisodeInput } from './dtos/update-episode.dto';
import { UpdatePodcastInput } from './dtos/update-podcast.dto';
import { Episode } from './entities/episode.entity';
import { Podcast } from './entities/podcast.entity';
import { CoreOutput } from './dtos/output.dto';
import {
  PodcastOutput,
  EpisodesOutput,
  EpisodesSearchInput,
  GetAllPodcastsOutput,
  GetEpisodeOutput,
  MarkEpisodeAsPlayedInput,
  MarkEpisodeAsPlayedOutput,
} from './dtos/podcast.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { SearchPodcastByTitleInput, SearchPodcastByTitleOutput } from './dtos/searchPodcasts.dto';
import { CreateReviewInput, CreateReviewOutput } from './dtos/create-review.dto';
import { User } from 'src/users/entities/user.entity';
import { Review } from './entities/review.entity';
import { SeeSubCriptionsOutput, SubscribePodcastInput, SubscribePodcastOutput } from './dtos/subscribe-podcast.dto';
import { userInfo } from 'os';

@Injectable()
export class PodcastsService {
  constructor(
    @InjectRepository(Podcast)
    private readonly podcastRepository: Repository<Podcast>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  private readonly InternalServerErrorOutput = {
    ok: false,
    error: 'Internal server error occurred.',
  };

  async getAllPodcasts(): Promise<GetAllPodcastsOutput> {
    try {
      const podcasts = await this.podcastRepository.find();
      return {
        ok: true,
        podcasts,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async createPodcast({
    title,
    category,
  }: CreatePodcastInput): Promise<CreatePodcastOutput> {
    try {
      const newPodcast = this.podcastRepository.create({ title, category });
      const { id } = await this.podcastRepository.save(newPodcast);
      return {
        ok: true,
        id,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async getPodcast(id: number): Promise<PodcastOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(
        { id },
        { relations: ['episodes', 'subscriber'] },
      );
      if (!podcast) {
        return {
          ok: false,
          error: `Podcast with id ${id} not found`,
        };
      }
      return {
        ok: true,
        podcast,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async deletePodcast(id: number): Promise<CoreOutput> {
    try {
      const { ok, error } = await this.getPodcast(id);
      if (!ok) {
        return { ok, error };
      }
      await this.podcastRepository.delete({ id });
      return { ok };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async updatePodcast({
    id,
    payload,
  }: UpdatePodcastInput): Promise<CoreOutput> {
    try {
      const { ok, error, podcast } = await this.getPodcast(id);
      if (!ok) {
        return { ok, error };
      }

      if (
        payload.rating !== null &&
        (payload.rating < 1 || payload.rating > 5)
      ) {
        return {
          ok: false,
          error: 'Rating must be between 1 and 5.',
        };
      } else {
        const updatedPodcast: Podcast = { ...podcast, ...payload };
        await this.podcastRepository.save(updatedPodcast);
        return { ok };
      }
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async getEpisodes(podcastId: number): Promise<EpisodesOutput> {
    const { podcast, ok, error } = await this.getPodcast(podcastId);
    if (!ok) {
      return { ok, error };
    }
    return {
      ok: true,
      episodes: podcast.episodes,
    };
  }

  async getEpisode({
    podcastId,
    episodeId,
  }: EpisodesSearchInput): Promise<GetEpisodeOutput> {
    const { episodes, ok, error } = await this.getEpisodes(podcastId);
    if (!ok) {
      return { ok, error };
    }
    const episode = episodes.find(episode => episode.id === episodeId);
    if (!episode) {
      return {
        ok: false,
        error: `Episode with id ${episodeId} not found in podcast with id ${podcastId}`,
      };
    }
    return {
      ok: true,
      episode,
    };
  }

  async createEpisode({
    podcastId,
    title,
    category,
  }: CreateEpisodeInput): Promise<CreateEpisodeOutput> {
    try {
      const { podcast, ok, error } = await this.getPodcast(podcastId);
      if (!ok) {
        return { ok, error };
      }
      const newEpisode = this.episodeRepository.create({ title, category });
      newEpisode.podcast = podcast;
      const { id } = await this.episodeRepository.save(newEpisode);
      return {
        ok: true,
        id,
      };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async deleteEpisode({
    podcastId,
    episodeId,
  }: EpisodesSearchInput): Promise<CoreOutput> {
    try {
      const { episode, error, ok } = await this.getEpisode({
        podcastId,
        episodeId,
      });
      if (!ok) {
        return { ok, error };
      }
      await this.episodeRepository.delete({ id: episode.id });
      return { ok: true };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  async updateEpisode({
    podcastId,
    episodeId,
    ...rest
  }: UpdateEpisodeInput): Promise<CoreOutput> {
    try {
      const { episode, ok, error } = await this.getEpisode({
        podcastId,
        episodeId,
      });
      if (!ok) {
        return { ok, error };
      }
      const updatedEpisode = { ...episode, ...rest };
      await this.episodeRepository.save(updatedEpisode);
      return { ok: true };
    } catch (e) {
      return this.InternalServerErrorOutput;
    }
  }

  /** @@@ 
   *  For Listener  
   *  */

  async searchByTitle({ title, page }: SearchPodcastByTitleInput): Promise<SearchPodcastByTitleOutput> {
    //forntend handle if send empty letter
    try {
      const targetTitle = title.trim()
      if (targetTitle === "") {
        return { ok: false, error: "Can not pass the empty string type at least 2 letters" }
      }
      const [podcasts, total] = await this.podcastRepository.findAndCount({
        where: {
          title: Like(`%${title}%`),
        },
        order: {
          createdAt: "DESC"
        },
        skip: (page - 1) * 10,
        take: 10
      })
      return { ok: true, podcasts, totalPage: Math.ceil(total / 10) }
    }
    catch (e) {
      console.log("In Search By title", e)
      return this.InternalServerErrorOutput
    }
  }

  async createReview(createReviewInput: CreateReviewInput, userId: number): Promise<CreateReviewOutput> {
    try {
      if (createReviewInput.review.trim() === "") {
        return {
          ok: false,
          error: "Can't not leave a Review without any text"
        }
      }
      const { podcast, ok, error } = await this.getPodcast(createReviewInput.podcastId);
      if (!podcast) {
        return {
          ok: false,
          error: "This Podcast does not exist, Please Check Podcast First"
        }
      }
      const user = await this.userRepository.findOne({ id: userId })
      const newReview = await this.reviewRepository.create({ review: createReviewInput.review, podcast, user })
      const { id } = await this.reviewRepository.save(newReview)
      return {
        ok: true,
        id
      }
    } catch (e) {
      console.log("In Create Review", e)
      return this.InternalServerErrorOutput
    }
  }

  async subscribePodcast(podcastId: number, userId: number): Promise<SubscribePodcastOutput> {
    try {
      const podcast = await this.podcastRepository.findOne({ id: podcastId })
      if (!podcast) {
        return {
          ok: false,
          error: "This podcast does not exist"
        }
      }
      const user = await this.userRepository.findOne({ id: userId })
      if (!user.subscribe === undefined) {
        user.subscribe = [podcast]
      } else {
        user.subscribe = [...user.subscribe, podcast]
      }
      await this.userRepository.save(user)

      return { ok: true }
    } catch (e) {
      return this.InternalServerErrorOutput
    }
  }
  //Does not need to go user parts ? idk
  async seeSubscriptions(userId: number): Promise<SeeSubCriptionsOutput> {
    try {
      const user = await this.userRepository.findOne({ id: userId }, { relations: ["subscribe"] })
      return { ok: true, podcasts: user.subscribe }
    } catch (e) {
      console.log(e)
      return this.InternalServerErrorOutput
    }
  }

  async markedAsPlayed(userId: number, input: MarkEpisodeAsPlayedInput): Promise<MarkEpisodeAsPlayedOutput> {
    try {
      const { episode, ok, error } = await this.getEpisode(input)
      if (!ok) {
        return { ok: false, error: "Can't Marking the Epiosde" }
      }
      const user = await this.userRepository.findOne({ id: userId })
      if (!episode.played) {
        episode.played = [user]
      } else {
        episode.played = [...episode.played, user]
      }
      await this.episodeRepository.save(episode)
      return {
        ok: true
      }
    } catch (e) {
      console.log("✅✅✅✅✅✅✅✅✅✅", e)
      return this.InternalServerErrorOutput
    }
  }
}
