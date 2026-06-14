import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    PostLike,
    PostLikeDocument,
    PostLikeModelType,
} from '../domain/post-like.entity';

@Injectable()
export class PostLikesCommandRepository {
    constructor(
        @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
    ) {}

    async save(postLike: PostLikeDocument): Promise<void> {
        await postLike.save();
    }

    async findSinglePostLikeByPostIdAndUserId(
        sentPostId: string,
        sentUserId: string,
    ): Promise<PostLikeDocument | null> {
        return this.PostLikeModel.findOne({
            postId: sentPostId,
            userId: sentUserId,
        });
    }
}
