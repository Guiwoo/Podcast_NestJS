import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { Review } from "../entities/review.entity";
import { CoreOutput } from "./output.dto";

@InputType()
export class CreateReviewInput extends PickType(Review, ["review"], InputType) {
    @Field(type => Number)
    podcastId: number
}

@ObjectType()
export class CreateReviewOutput extends CoreOutput {
    @Field(type => Number, { nullable: true })
    id?: number
}