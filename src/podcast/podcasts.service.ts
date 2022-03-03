import { Injectable } from '@nestjs/common';
import { CreateEpisodeDto } from './dtos/create-episode.dto';
import { CreatePodcastDto } from './dtos/create-podcast.dto';
import { UpdateEpisodeDto } from './dtos/update-episode.dto';
import { UpdatePodcastDto } from './dtos/update-podcast.dto';
import { Episode } from './entities/episode.entity';
import { Podcast } from './entities/podcast.entity';
import {
  PodcastOutput,
  EpisodesOutput,
  EpisodesSearchInput,
} from './dtos/podcast.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOutput } from 'src/core/dtos/coreOutput.dto';


const flaseAndError = (msg: string): CoreOutput => {
  return {
    ok: false,
    error: msg
  }
}

@Injectable()
export class PodcastsService {
  constructor(
    @InjectRepository(Podcast) private readonly podcastRepository: Repository<Podcast>,
    @InjectRepository(Episode) private readonly episodeRepository: Repository<Episode>
  ) { }

  async getAllPodcasts(): Promise<Podcast[]> {
    return await this.podcastRepository.find({ relations: ["episodes"] })
  }

  async createPodcast({ title, category }: CreatePodcastDto): Promise<CoreOutput> {
    const exsistTitle = await this.podcastRepository.findOne({ title })
    try {
      if (exsistTitle) {
        return flaseAndError("This Podcast Title Already has taken")
      }
      await this.podcastRepository.save(this.podcastRepository.create({
        title,
        category,
        episodes: []
      }))
      return {
        ok: true
      }
    } catch (error) {
      return {
        ok: false,
        error: `Can not make a Podcast\n Error on:\n ${error}`
      }
    }
  }

  async getPodcast(id: number): Promise<PodcastOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(id, {
        relations: ["episodes"]
      })
      if (!podcast) {
        return flaseAndError("This Podcast does not exsist")
      }
      return {
        ok: true,
        podcast
      }
    } catch (error) {
      return {
        ok: false,
        error: `Can not get a Podcast id is ${id} Error on:\n ${error}`
      }
    }
  }

  async deletePodcast(id: number): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(id)
      if (!podcast) {
        return flaseAndError("This Podcast does not Exsist")
      }
      await this.podcastRepository.delete(id)
      return {
        ok: true
      }
    } catch (error) {
      return {
        ok: false,
        error: `Could not Delete Podcast id is ${id}\nError on:\n ${error}`
      }
    }
  }

  async updatePodcast({ id, ...rest }: UpdatePodcastDto): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(id)
      if (!podcast) {
        return flaseAndError("This Podcast does not Exsist")
      }
      await this.podcastRepository.update(id, { ...rest })
      return {
        ok: true
      }
    } catch (error) {
      return {
        ok: false,
        error: `Could not update this podcast id is ${id}\nError on:\n${error}`
      }
    }
  }

  async getEpisodes(podcastId: number): Promise<EpisodesOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(podcastId, { relations: ["episodes"] })
      if (!podcast) {
        return flaseAndError("This Podcast does not exist")
      }
      return {
        ok: true,
        episodes: podcast.episodes
      }
    } catch (error) {
      return {
        ok: false,
        error: `Could not get Episodes from Podcast id is ${podcastId}\nError on:\n${error}`
      }
    }
  }

  async createEpisode({
    podcastId,
    title,
    category,
  }: CreateEpisodeDto): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(podcastId)
      if (!podcast) {
        return flaseAndError("This Podcast does not exsist")
      }
      await this.episodeRepository.save(this.episodeRepository.create({
        podcast,
        title,
        category
      }))
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: `Could not create a Episode in Podcast id is ${podcastId}\nError on:\n${error}`
      }
    }
  }

  async deleteEpisode({ podcastId, episodeId }: EpisodesSearchInput): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(podcastId)
      const episode = await this.episodeRepository.findOne(episodeId)
      if (!podcast) {
        return flaseAndError("This Podcast does not exist")
      }
      if (!episode) {
        return flaseAndError("This Episode does not exist")
      }
      await this.episodeRepository.delete(episodeId)
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: `Could not Delete Episode id is ${episodeId} in Podcast id is ${podcastId}`
      }
    }
  }

  async updateEpisode({
    podcastId,
    episodeId,
    ...rest
  }: UpdateEpisodeDto): Promise<CoreOutput> {
    try {
      const podcast = await this.podcastRepository.findOne(podcastId)
      const episode = await this.episodeRepository.findOne(episodeId)
      if (!podcast) {
        return flaseAndError("This Podcast does not exist")
      }
      if (!episode) {
        return flaseAndError("This Episode does not exist")
      }
      await this.episodeRepository.update(episodeId, {
        ...rest
      })
      return {
        ok: true
      }
    } catch (error) {
      return {
        ok: false,
        error: `Could not update this Episode id is ${episodeId} in Podcast id is ${podcastId}\nError on:\n${error}`
      }
    }
  }
}
