import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlogDocument } from '../../blogs/domain/blog.entity';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatus } from '../../../../core/enums/like-status.enum';

@Injectable()
export class PostsCommandRepository {
    constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

    async save(post: PostDocument): Promise<void> {
        await post.save();
    }

    async findSinglePostById(sentPostId: string): Promise<PostDocument | null> {
        return this.PostModel.findOne({ _id: sentPostId, deletedAt: null });
    }

    // методы для переключения лайков
    async addPostReaction({
        sentPostId,
        newStatus,
    }: {
        sentPostId: string;
        newStatus: LikeStatus;
    }): Promise<boolean> {
        try {
            const updateQuery =
                newStatus === LikeStatus.Like
                    ? { 'extendedLikesInfo.likesCount': 1 }
                    : { 'extendedLikesInfo.dislikesCount': 1 };

            // атомарный апдейт для избегания состояния гонки
            const result = await this.PostModel.updateOne(
                { _id: sentPostId },
                { $inc: updateQuery },
            );

            // если matchedCount === 0, значит поста с таким ID уже нет в базе
            if (result.matchedCount === 0) {
                console.error(
                    `Couldn't find post with id: ${sentPostId} inside PostsCommandRepository.addPostReaction`,
                );

                return false;
            }

            return true;
        } catch (error) {
            console.error(
                ` Error inside PostsCommandRepository.addPostReaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw new InternalServerErrorException('Internal server error');
        }
    }

    // async nullifyingPostReaction(
    //     sentPostId: string,
    //     oldStatus: LikeStatus,
    // ): Promise<boolean> {
    //     try {
    //         const fieldToDecrement = oldStatus === LikeStatus.Like
    //             ? 'extendedLikesInfo.likesCount'
    //             : 'extendedLikesInfo.dislikesCount';
    //
    //         // создаем фильтр: ищем по ID И проверяем, что в поле больше 0
    //         const filter: any = {
    //             _id: sentPostId,
    //             [fieldToDecrement]: { $gt: 0 } // Защита от ухода в минус
    //         };
    //
    //         // выполняем атомарное уменьшение
    //         const result = await PostModel.updateOne(
    //             filter,
    //             { $inc: { [fieldToDecrement]: -1 } }
    //         );
    //
    //         if (result.matchedCount === 0) {
    //             console.error(`Couldn't find post with id: ${sentPostId} inside  PostsCommandRepository.nullifyingPostReaction`);
    //
    //             return false;
    //         }
    //
    //         return true;
    //     } catch (error) {
    //         console.error(
    //             `Error inside PostsCommandRepository.nullifyingPostReaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    //         );
    //
    //         return false;
    //     }
    // },
    //
    // async switchPostReaction(
    //     sentPostId: string,
    //     newStatus: LikeStatus,
    // ): Promise<boolean> {
    //     try {
    //         // это не нужно, т.к. updateOne сам найдет и обновит, дополнительно это делать и проверять - лишняя операция
    //         // const comment: CommentDocument | null =
    //         //     await CommentModel.findById(sentCommentId);
    //         //
    //         // if (!comment) {
    //         //     console.error(
    //         //         `Couldn't find comment with id: ${sentCommentId} inside CommentsCommandRepository.switchCommentReaction`,
    //         //     );
    //         //
    //         //     return false;
    //         // }
    //
    //         // Определяем, что прибавляем, а что отнимаем
    //         const isEnablingLike = newStatus === LikeStatus.Like;
    //
    //         // Нужно убедиться, что dislikesCount > 0 перед вычитанием.
    //         const filter: any = { _id: sentPostId };
    //
    //         if (isEnablingLike) {
    //             filter["extendedLikesInfo.dislikesCount"] = { $gt: 0 };
    //         } else {
    //             filter["extendedLikesInfo.likesCount"] = { $gt: 0 };
    //         }
    //
    //         const updateQuery = isEnablingLike
    //             ? { "extendedLikesInfo.likesCount": 1, "extendedLikesInfo.dislikesCount": -1 }
    //             : { "extendedLikesInfo.likesCount": -1, "extendedLikesInfo.dislikesCount": 1 };
    //
    //         // используем атомарный updateOne вместо save(), чтобы избежать состояния гонки
    //         const result = await PostModel.updateOne(filter, {
    //             $inc: updateQuery,
    //         });
    //
    //         // result.matchedCount > 0 означает, что комментарий найден и обновлен
    //         if (result.matchedCount === 0) {
    //             console.error(
    //                 `Couldn't find post with id: ${sentPostId} inside PostsCommandRepository.switchPostReaction`,
    //             );
    //
    //             return false;
    //         }
    //
    //         return true;
    //     } catch (error) {
    //         console.error(
    //             `Error saving post reaction inside PostsCommandRepository.switchPostReaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    //         );
    //
    //         return false;
    //     }
    // },
}
