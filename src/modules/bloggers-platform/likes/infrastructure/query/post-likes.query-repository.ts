import {
    PostLike,
    PostLikeDocument,
    PostLikeModelType,
} from '../../domain/post-like.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostLikesQueryRepository {
    constructor(
        @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
    ) {}

    async findSinglePostLikeByPostIdAndUserId(
        sentPostId: string,
        sentUserId: string,
    ): Promise<PostLikeDocument | null> {
        return this.PostLikeModel.findOne({
            postId: sentPostId,
            userId: sentUserId,
        });
    }

    async checkIfUserAlreadyReactedToPost(
        sentPostId: string,
        sentUserId: string,
    ): Promise<boolean> {
        return !!(await this.PostLikeModel.exists({
            postId: sentPostId,
            userId: sentUserId,
        }));
    }
}
