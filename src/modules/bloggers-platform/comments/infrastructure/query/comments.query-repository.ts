import {
    Comment,
    CommentDocument,
    CommentModelType,
} from '../../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import { FlattenMaps, Types } from 'mongoose';

@Injectable()
export class CommentsQueryRepository {
    constructor(
        @InjectModel(Comment.name) private CommentModel: CommentModelType,
    ) {}

    async getCommentById(id: string): Promise<CommentViewDto | null> {
        const comment = await this.CommentModel.findOne({
            _id: id,
            deletedAt: null,
        }).lean<FlattenMaps<CommentDocument> & { _id: Types.ObjectId }>();

        if (!comment) {
            return null;
        }

        return CommentViewDto.mapToView(comment);
    }

    async getCommentsByPostId({
        userId,
        postId,
        query,
    }: {
        userId?: string | null;
        postId: string;
        query: GetCommentsQueryParams;
    }): Promise<PaginatedViewDto<CommentViewDto>> {
        const { sortBy, sortDirection, pageNumber, pageSize } = query;
        const sentPostId = postId;
        const sentUserId = userId;

        const skip = query.calculateSkip();
        // const skip = (pageNumber - 1) * pageSize;
        const filter = {
            deletedAt: null,
            ...(sentPostId ? { relatedPostId: sentPostId } : {}),
        };

        const [commentsList, totalCount] = await Promise.all([
            this.CommentModel.find(filter)
                .sort({
                    [sortBy]: sortDirection === SortDirection.Asc ? 1 : -1,
                })
                .skip(skip)
                .limit(pageSize)
                .lean<
                    (FlattenMaps<CommentDocument> & { _id: Types.ObjectId })[]
                >(),

            this.CommentModel.countDocuments(filter),
        ]);

        // ЭТА ЧАСТЬ ПОКА ЧТО НЕ НУЖНА, НУЖНО БУДТЕТ ПРАВИТЬ КОГДА ПОЯВЯТСЯ КОММЕНТЫ И ЛАКИ С АВТОРИЗАЦИЕЙ
        // const postIdsList = commentsList.map((post) => post.id);
        // let postsReactionList: (PostsLikesStorageModel & { _id: ObjectId })[] =
        //     [];
        // if (sentUserId) {
        //     const postsReactionList =
        //         await this.postsLikesQueryRepository.getReactionListForPosts(
        //             postIdsList,
        //             sentUserId,
        //         );
        // }

        // return mapToPostListPaginatedOutput(commentsList, postsReactionList, {
        //     pageNumber: pageNumber,
        //     pageSize: pageSize,
        //     totalCount: totalCount,
        // });

        return PaginatedViewDto.mapToView<CommentViewDto>({
            items: commentsList.map((item) => CommentViewDto.mapToView(item)),
            page: pageNumber,
            size: pageSize,
            totalCount: totalCount,
        });
    }
}
