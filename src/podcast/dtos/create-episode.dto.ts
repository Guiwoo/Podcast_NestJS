import { Field, InputType } from '@nestjs/graphql';
import { CreatePodcastInput } from './create-podcast.dto';

@InputType()
export class CreateEpisodeInput extends CreatePodcastInput {
    @Field(types => Number)
    podcastId: number
}