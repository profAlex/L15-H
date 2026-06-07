import {BaseQueryParams} from "../../../../../core/dto/base.query-params.input-dto";
import {BlogsSortBy} from "./blogs-sort-by";
import {ApiProperty} from "@nestjs/swagger";

export class GetBlogsQueryParams extends BaseQueryParams {
    @ApiProperty({required: false})
    sortBy = BlogsSortBy.CreatedAt;

    @ApiProperty({required: false})
    searchNameTerm: string | null = null;
}