import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    CommentLike,
    CommentLikeDocument,
    CommentLikeModelType,
} from '../../domain/comment-like.entity';

@Injectable()
export class CommentLikesQueryRepository {
    constructor(
        @InjectModel(CommentLike.name)
        private PostLikeModel: CommentLikeModelType,
    ) {}

    async findSingleCommentLikeByPostIdAndUserId(
        sentPostId: string,
        sentUserId: string,
    ): Promise<CommentLikeDocument | null> {
        return this.PostLikeModel.findOne({
            postId: sentPostId,
            userId: sentUserId,
        });
    }

    async checkIfUserAlreadyReactedToComment(
        sentPostId: string,
        sentUserId: string,
    ): Promise<boolean> {
        return !!(await this.PostLikeModel.exists({
            postId: sentPostId,
            userId: sentUserId,
        }));
    }

    // async getLatestLikesForComment(
    //     sentPostId: string,
    // ): Promise<LatestLikeDetailViewDto[]> {
    //     const latestLikesArray = await this.PostLikeModel.find({
    //         postId: sentPostId,
    //         likeStatus: LikeStatus.Like,
    //     })
    //         .sort({ createdAt: -1 })
    //         .limit(3)
    //         .lean();
    //
    //     return latestLikesArray.map((likeInfo) => {
    //         return {
    //             addedAt: likeInfo.updatedAt.toISOString(),
    //             userId: likeInfo.userId,
    //             login: likeInfo.userLogin,
    //         };
    //     });
    // }
}
