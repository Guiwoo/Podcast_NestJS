import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString } from "class-validator";
import { CoreOutput } from "src/users/dtos/output.dto";
import { Podcast } from "../entities/podcast.entity";

@InputType()
export class SearchPodcastByTitleInput {
    @Field(type => String)
    @IsString()
    title: string

    @Field(type => Number, { defaultValue: 1 })
    @IsNumber()
    page?: number
}

@ObjectType()
export class SearchPodcastByTitleOutput extends CoreOutput {
    @Field(type => [Podcast], { nullable: true })
    podcasts?: Podcast[]
}