import {ApiParam, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query} from "@nestjs/common";
import {PaginatedViewDto} from "../../../../core/dto/base.paginated.view-dto";
import {CommentViewDto} from "../../comments/api/view-dto/comments.view-dto";
import {GetCommentsQueryParams} from "../../comments/api/input-dto/get-comments-query-params.input-dto";
import {CommentsService} from "../../comments/application/comments.service";
import {GetPostsQueryParams} from "./input-dto/get-posts-query-params.input-dto";
import {PostViewDto} from "./view-dto/posts.view-dto";
import {PostsService} from "../application/posts.service";
import {PostsQueryRepository} from "../infrastructure/query/posts.query-repository";
import {CreatePostApiInputDto} from "./input-dto/create-post.api.input-dto";
import {UpdatePostInputDto} from "../dto/create-post-input.dto";

@ApiTags('Posts endpoint')
@Controller('posts')
export class PostsController {
    constructor(private commentsService: CommentsService,
                private postsService: PostsService,
                private postsQueryRepository: PostsQueryRepository,) {
        console.log('PostsController created');
    }

    @ApiParam({name: 'postId'}) //для сваггера
    @Get(':postId/comments')
    async getCommentsByPostId(@Param('postId') postId: string, @Query() query: GetCommentsQueryParams): Promise<PaginatedViewDto<CommentViewDto>> {
        return this.commentsService.getCommentsByPostId({postId, query});
    }

    @Get()
    async getAllPosts(@Query() query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto>> {
        return this.postsQueryRepository.getAllPosts({query});
    }

    @Post()
    async createPost(@Body() body: CreatePostApiInputDto): Promise<PostViewDto> {
        return this.postsService.createPost(body);
    }

    @Get(':id')
    async getPostById(@Param('id') id: string): Promise<PostViewDto> {
        return this.postsQueryRepository.getPostByIdOrNotFoundFail(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updatePostById(@Param('id') id: string, @Body() body: UpdatePostInputDto): Promise<void> {
        return this.postsService.updatePostById({
            postId: id,
            updateInputData: body
        });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePostId(@Param('id') id: string): Promise<void> {
        return this.postsService.deletePostById(id);
    }
}