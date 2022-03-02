import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { CoreOutput } from "./dtos/common.dto";
import { CreateEpisodeInput } from "./dtos/create-episode.dto";
import { CreatePodcastInput } from "./dtos/create-podcast.dto";
import { EpisodeOutput, EpisodesOutput } from "./dtos/episodes.dto";
import { PodcastOutput, PodcastsOutPut } from "./dtos/podcasts.dto";
import { UpdateEpisodeInput } from "./dtos/update-episode.dto";
import { UpdatePodcastInput } from "./dtos/update-podcast.dto";
import { Podcast } from "./entities/podcast.entity";
import { PodcastsService } from "./podcasts.service";

@Resolver(of => Podcast)
export class PodcastsResolver {

    constructor(private readonly podcastsService: PodcastsService) { }
    /** Query Section */
    @Query(() => PodcastsOutPut)
    allPodcast(): PodcastsOutPut {
        return this.podcastsService.getAllPodcasts()
    }

    @Query(() => PodcastOutput)
    getPodcast(@Args('id') id: number): PodcastOutput {
        return this.podcastsService.getPodcast(id)
    }

    @Query(() => EpisodesOutput)
    allEpisodes(@Args('id') id: number): EpisodesOutput {
        return this.podcastsService.getEpisodes(id)
    }

    @Query(() => EpisodeOutput)
    getEpisode(@Args('podcastId') podcastId: number, @Args('episodeId') episodeId: number): EpisodeOutput {
        return this.podcastsService.getEpisode(podcastId, episodeId)
    }

    /** Mutation Section */
    @Mutation(() => CoreOutput)
    createPodcast(@Args('input') input: CreatePodcastInput): CoreOutput {
        return this.podcastsService.createPodcast(input)
    }

    @Mutation(() => CoreOutput)
    deletePodcast(@Args('id') id: number): CoreOutput {
        return this.podcastsService.deletePodcast(id)
    }

    @Mutation(() => CoreOutput)
    updatePodcast(@Args("input") input: UpdatePodcastInput): CoreOutput {
        return this.podcastsService.updatePodcast(input)
    }

    @Mutation(() => CoreOutput)
    createEpisode(@Args("input") input: CreateEpisodeInput): CoreOutput {
        return this.podcastsService.createEpisode(input)
    }

    @Mutation(() => CoreOutput)
    updateEpisode(@Args("input") input: UpdateEpisodeInput): CoreOutput {
        return this.podcastsService.updateEpisode(input)
    }

    @Mutation(() => CoreOutput)
    deleteEpisode(@Args('podcastId') podcastId: number, @Args('episodeId') episodeId: number): CoreOutput {
        return this.podcastsService.deleteEpisode(podcastId, episodeId)
    }

}