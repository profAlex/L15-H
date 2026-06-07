import {Injectable, NotFoundException} from "@nestjs/common";
import {GetPostsQueryParams} from "../../api/input-dto/get-posts-query-params.input-dto";
import {PostViewDto} from "../../api/view-dto/posts.view-dto";
import {PaginatedViewDto} from "../../../../../core/dto/base.paginated.view-dto";
import {InjectModel} from "@nestjs/mongoose";
import {Post, PostModelType} from "../../domain/post.entity";
import {SortDirection} from "../../../../../core/dto/base.query-params.input-dto";
import {DomainException} from "../../../../../core/exceptions/domain-exceptions";
import {DomainExceptionCode} from "../../../../../core/exceptions/domain-exception-codes";

@Injectable()
export class PostsQueryRepository {
    constructor(@InjectModel(Post.name) private PostModel: PostModelType) {
    }

    async ifPostExists(id: string): Promise<boolean> {
        const count = await this.PostModel.countDocuments({_id: id, deletedAt: null});

        return count > 0;
    }


    async getPostsByBlogId({userId, blogId, query}: {
        userId?: string | null,
        blogId: string,
        query: GetPostsQueryParams
    }): Promise<PaginatedViewDto<PostViewDto>> {
        const {sortBy, sortDirection, pageNumber, pageSize} =
            query;
        const sentBlogId = blogId;
        const sentUserId = userId;

        const skip = query.calculateSkip();
        // const skip = (pageNumber - 1) * pageSize;
        const filter = {
            deletedAt: null,
            ...(sentBlogId ? {blogId: sentBlogId} : {})
        };

        const [postsList, totalCount] = await Promise.all([
            this.PostModel.find(filter)
                .sort({
                    [sortBy]:
                        sortDirection === SortDirection.Asc
                            ? 1
                            : -1,
                })
                .skip(skip)
                .limit(pageSize)
                .lean(),

            this.PostModel.countDocuments(filter),
        ]);

        // ЭТА ЧАСТЬ ПОКА ЧТО НЕ НУЖНА, НУЖНО БУДТЕТ ПРАВИТЬ КОГДА ПОЯВЯТСЯ КОММЕНТЫ И ЛАКИ С АВТОРИЗАЦИЕЙ
        // const postIdsList = postsList.map((post) => post.id);
        // let postsReactionList: (PostsLikesStorageModel & { _id: ObjectId })[] =
        //     [];
        // if (sentUserId) {
        //     const postsReactionList =
        //         await this.postsLikesQueryRepository.getReactionListForPosts(
        //             postIdsList,
        //             sentUserId,
        //         );
        // }

        // return mapToPostListPaginatedOutput(postsList, postsReactionList, {
        //     pageNumber: pageNumber,
        //     pageSize: pageSize,
        //     totalCount: totalCount,
        // });

        return PaginatedViewDto.mapToView<PostViewDto>({
            items: postsList.map(item => PostViewDto.mapToView(item)),
            page: pageNumber,
            size: pageSize,
            totalCount: totalCount,
        })
    }

    async getAllPosts({sentUserId, query}: {
        sentUserId?: string,
        query: GetPostsQueryParams
    }): Promise<PaginatedViewDto<PostViewDto>> {
        const {sortBy, sortDirection, pageNumber, pageSize} =
            query;
        const skip = query.calculateSkip();
        const filter = {
            deletedAt: null,
        };
        const [postsList, totalCount] = await Promise.all([
            this.PostModel.find(filter).sort({[sortBy]: sortDirection === SortDirection.Asc ? 1 : -1}).skip(skip).limit(pageSize).lean(),
            this.PostModel.countDocuments(filter),
        ]);

        // ЭТА ЧАСТЬ ПОКА ЧТО НЕ НУЖНА, НУЖНО БУДТЕТ ПРАВИТЬ КОГДА ПОЯВЯТСЯ КОММЕНТЫ И ЛАКИ С АВТОРИЗАЦИЕЙ
        // const postIdsList = postsList.map((post) => post.id);
        // let postsReactionList: (PostsLikesStorageModel & { _id: ObjectId })[] =
        //     [];
        // if (sentUserId) {
        //     const postsReactionList =
        //         await this.postsLikesQueryRepository.getReactionListForPosts(
        //             postIdsList,
        //             sentUserId,
        //         );
        // }

        // return mapToPostListPaginatedOutput(postsList, postsReactionList, {
        //     pageNumber: pageNumber,
        //     pageSize: pageSize,
        //     totalCount: totalCount,
        // });

        return PaginatedViewDto.mapToView<PostViewDto>({
            items: postsList.map(item => PostViewDto.mapToView(item)),
            page: pageNumber,
            size: pageSize,
            totalCount: totalCount
        })
    }

    async getPostByIdOrNotFoundFail(sentPostId: string): Promise<PostViewDto> {
        const post = await this.PostModel.findOne({deletedAt: null, _id: sentPostId});
        if (!post) {
            // throw new NotFoundException("Post not found");
            throw new DomainException({
                code: DomainExceptionCode.PostNotFound,
                message: `Post not found`,
            });
        }

        return PostViewDto.mapToView(post);
    }

}