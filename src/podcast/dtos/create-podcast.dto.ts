import { InputType, PickType } from '@nestjs/graphql';
import { Podcast } from '../entities/podcast.entity';

@InputType()
export class CreatePodcastDto extends PickType(Podcast, ["title", "category"]) { }
