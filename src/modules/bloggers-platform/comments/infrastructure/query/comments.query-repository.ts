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
import { LikeStatus } from '../../../../../core/enums/like-status.enum';
import { CommentLikesQueryRepository } from '../../../likes/infrastructure/query/comment-likes.query-repository';

@Injectable()
export class CommentsQueryRepository {
    constructor(
        @InjectModel(Comment.name) private CommentModel: CommentModelType,
        private readonly commentLikesQueryRepository: CommentLikesQueryRepository,
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
        postId,
        query,
        userId,
    }: {
        postId: string;
        query: GetCommentsQueryParams;
        userId?: string | undefined;
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

        const likesMap = new Map<string, LikeStatus>(); // Ключ: postId, Значение: likeStatus

        if (sentUserId && commentsList.length > 0) {
            const commentIdsList = commentsList.map((comment) =>
                comment._id.toString(),
            );

            const userReactions =
                await this.commentLikesQueryRepository.getReactionListForComments(
                    commentIdsList,
                    sentUserId,
                );

            userReactions.forEach((reaction) => {
                likesMap.set(
                    reaction.commentId.toString(),
                    reaction.likeStatus,
                );
            });
        }

        return PaginatedViewDto.mapToView<CommentViewDto>({
            items: commentsList.map((item) => {
                const commentIdStr = item._id.toString();
                const myStatus = likesMap.get(commentIdStr) || LikeStatus.None;
                return CommentViewDto.mapToView(item, myStatus);
            }),
            page: pageNumber,
            size: pageSize,
            totalCount: totalCount,
        });
    }
}
