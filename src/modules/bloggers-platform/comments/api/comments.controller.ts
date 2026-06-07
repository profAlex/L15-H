import {Body, Controller, Get, NotFoundException, Param, Post} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {CommentViewDto} from "./view-dto/comments.view-dto";
import {CommentsQueryRepository} from "../infrastructure/query/comments.query-repository";
import {CreatePostApiInputDto} from "../../posts/api/input-dto/create-post.api.input-dto";
import {PostViewDto} from "../../posts/api/view-dto/posts.view-dto";
import {CreateCommentApiInputDto} from "./input-dto/create-comment.api.input-dto";
import {CommentsCommandRepository} from "../infrastructure/comments.command-repository";
import {CommentsService} from "../application/comments.service";
import {DomainException} from "../../../../core/exceptions/domain-exceptions";
import {DomainExceptionCode} from "../../../../core/exceptions/domain-exception-codes";

@ApiTags('Comments endpoint')
@Controller('comments')
export class CommentsController {
    constructor(private commentsQueryRepository: CommentsQueryRepository,
                private commentsCommandRepository: CommentsCommandRepository,
                private commentsService: CommentsService,) {
        console.log("CommentsController created");
    }

    @Get(":id")
    async getCommentById(@Param('id') commentId: string): Promise<CommentViewDto> {
        const comment = await this.commentsQueryRepository.getCommentById(commentId);

        if (!comment) {
            // throw new NotFoundException("Comment not found!");
            throw new DomainException({
                code: DomainExceptionCode.CommentNotFound,
                message: 'Comment not found!',
            });
        }

        return comment;
    }

    @Post()
    async createNewComment(@Body() body: CreateCommentApiInputDto): Promise<CommentViewDto> {
        const commentId = await this.commentsService.createNewComment(body);

        const comment = await this.commentsQueryRepository.getCommentById(commentId);

        if (!comment) {
            // throw new NotFoundException("Comment not found!");
            throw new DomainException({
                code: DomainExceptionCode.CommentNotFound,
                message: 'Comment not found!',
            });
        }

        return comment;
    }
}