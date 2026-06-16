import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CreatePostApiInputDto } from '../../posts/api/input-dto/create-post.api.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { CreateCommentApiInputDto } from './input-dto/create-comment.api.input-dto';
import { CommentsCommandRepository } from '../infrastructure/comments.command-repository';
import { CommentsService } from '../application/comments.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UserContextDto } from '../../../authorisation/guards/dto/user-context.dto';
import { BasicAuthGuard } from '../../../authorisation/guards/basic/basic.auth-guard';
import { ExtractUserIfExistsFromRequest } from '../../../authorisation/decorators/extract-user-if-exists.decorator';
import { DeletePostById } from '../../posts/application/usecases/delete-post-by-id.usecase';
import { DeleteCommentById } from '../application/usecases/delete-comment-by-id.usecase';
import { CommandBus } from '@nestjs/cqrs';

@ApiTags('Comments endpoint')
@Controller('comments')
export class CommentsController {
    constructor(
        private commentsQueryRepository: CommentsQueryRepository,
        private commentsCommandRepository: CommentsCommandRepository,
        private commentsService: CommentsService,
        private readonly commandBus: CommandBus,
    ) {
        console.log('CommentsController created');
    }

    @Get(':id')
    async getCommentById(
        @Param('id') commentId: string,
    ): Promise<CommentViewDto> {
        const comment =
            await this.commentsQueryRepository.getCommentById(commentId);

        if (!comment) {
            // throw new NotFoundException("Comment not found!");
            throw new DomainException({
                code: DomainExceptionCode.CommentNotFound,
                message: 'Comment not found!',
            });
        }

        return comment;
    }

    // @Post()
    // async createNewComment(@Body() body: CreateCommentApiInputDto): Promise<CommentViewDto> {
    //     const commentId = await this.commentsService.createNewComment(body);
    //
    //     const comment = await this.commentsQueryRepository.getCommentById(commentId);
    //
    //     if (!comment) {
    //         // throw new NotFoundException("Comment not found!");
    //         throw new DomainException({
    //             code: DomainExceptionCode.CommentNotFound,
    //             message: 'Comment not found!',
    //         });
    //     }
    //
    //     return comment;
    // }

    @ApiOperation({ summary: 'Delete comment specified by id' })
    @ApiParam({ name: 'commentId' })
    @UseGuards(BasicAuthGuard)
    @Delete(':commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCommentById(
        @Param('commentId') commentId: string,
        @ExtractUserIfExistsFromRequest() user: UserContextDto,
    ): Promise<void> {
        return this.commandBus.execute<DeleteCommentById>(
            new DeleteCommentById(commentId, user.id),
        );
    }
}
