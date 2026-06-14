import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    CommentLike,
    CommentLikeDocument,
    CommentLikeModelType,
} from '../domain/comment-like.entity';

@Injectable()
export class CommentLikesCommandRepository {
    constructor(
        @InjectModel(CommentLike.name)
        private CommentLikeModel: CommentLikeModelType,
    ) {}

    async save(commentLike: CommentLikeDocument): Promise<void> {
        await commentLike.save();
    }

    async findSingleCommentLikeByCommentIdAndUserId(
        sentCommentId: string,
        sentUserId: string,
    ): Promise<CommentLikeDocument | null> {
        return this.CommentLikeModel.findOne({
            postId: sentCommentId,
            userId: sentUserId,
        });
    }
}
