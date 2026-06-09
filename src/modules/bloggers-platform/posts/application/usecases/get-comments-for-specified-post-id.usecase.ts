import {
    Query,
    CommandHandler,
    ICommandHandler,
    QueryHandler,
    IQueryHandler,
} from '@nestjs/cqrs';
import { GetCommentsQueryParams } from '../../../comments/api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../../comments/api/view-dto/comments.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsQueryRepository } from '../../../comments/infrastructure/query/comments.query-repository';

export class GetCommentsForSpecificPostId extends Query<
    PaginatedViewDto<CommentViewDto> // This type represents the command execution result
> {
    constructor(
        public readonly postId: string,
        public readonly query: GetCommentsQueryParams,
        public readonly userId?: string | null,
    ) {
        super();
    }
}

@QueryHandler(GetCommentsForSpecificPostId)
export class GetCommentsForSpecificPostIdHandler implements IQueryHandler<GetCommentsForSpecificPostId> {
    constructor(
        private readonly postsQueryRepository: PostsQueryRepository,
        private readonly commentsQueryRepository: CommentsQueryRepository,
    ) {}

    async execute(busquery: GetCommentsForSpecificPostId) {
        const { userId, postId, query } = busquery;
        if (!(await this.postsQueryRepository.ifPostExists(postId))) {
            // throw new NotFoundException("Post not found");
            throw new DomainException({
                code: DomainExceptionCode.PostNotFound,
                message: 'Post not found',
            });
        }
        return await this.commentsQueryRepository.getCommentsByPostId({
            userId,
            postId,
            query,
        });
    }
}
