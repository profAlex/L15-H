import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';

export class GetPostById extends Query<PostViewDto> {
    constructor(public readonly id: string) {
        super();
    }
}

@QueryHandler(GetPostById)
export class GetPostByIdHandler implements IQueryHandler<GetPostById> {
    constructor(private postsQueryRepository: PostsQueryRepository) {}

    async execute({ id }: GetPostById): Promise<PostViewDto> {
        return this.postsQueryRepository.getPostByIdOrNotFoundFail(id);
    }
}
