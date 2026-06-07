import {BaseQueryParams} from "../../../../../core/dto/base.query-params.input-dto";
import {ApiProperty} from "@nestjs/swagger";
import {PostsSortBy} from "./posts-sort-by";


export class GetPostsQueryParams extends BaseQueryParams{
    @ApiProperty({required: false})
    sortBy = PostsSortBy.CreatedAt;
}