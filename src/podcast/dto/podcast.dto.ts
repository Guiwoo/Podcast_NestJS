import { Episode, Podcast } from '../entities/podcast.entity';

export interface ResultOutput {
  result: Podcast[];
}

export interface OkOutput {
  ok: boolean;
  error?: string;
}

// Create Podcast input and output
export type CreatePodcastInput = Omit<Podcast, 'id'>;

//Find Podcast
export interface FindOutput extends OkOutput {
  result?: Podcast;
}

// Update Podcast
export type UpdateInput = Partial<CreatePodcastInput>;

// Get a all Episodes by podcast id
export interface ResultEpisodeOutput extends OkOutput {
  result?: Episode[];
}

// Create Podcast Input
export type EpisodeInput = Omit<Episode, 'id'>;

// Update PodCast Episode
export type UpdateEpisode = Partial<EpisodeInput>;
