import {LikeStatus} from "../../../../../core/enums/like-status.enum";
import {CommentDocument} from "../../domain/comment.entity";
import {FlattenMaps, Types} from "mongoose";

// export type CommentStorageModel = {
//     _id: ObjectId;
//     id: string;
//     relatedPostId: string;
//     content: string;
//     commentatorInfo: CommentatorInfo;
//     createdAt: Date;
//     likesInfo: LikesInfoViewModel;
// };
//
// export type CommentatorInfo = {
//     userId: string;
//     userLogin: string;
// };
//
// export type LikesInfo = {
//     likesCount: number;
//     dislikesCount: number;
//     myStatus: LikeStatus;
// }

// export enum LikeStatus {
//     None = 'None',
//     Like = 'Like',
//     Dislike = 'Dislike'
// }

export class CommentViewDto {
    id: string;
    content: string;
    commentatorInfo: {
        userId: string,
        userLogin: string,
    };
    createdAt: string;
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: LikeStatus
    }

    static mapToView(comment: FlattenMaps<CommentDocument> & { _id: Types.ObjectId }): CommentViewDto {
        const newComment = new CommentViewDto();

        newComment.id = comment._id.toString();
        newComment.content = comment.content;
        // вложенные объекты (likesInfo, commentatorInfo, extendedLikesInfo) всегда должны создаваться «целиком» через фигурные скобки { ... }.
        // или создавать их при инициализации нового инстанса, выше объявлении должно быть написано так:
        // commentatorInfo = {
        //         userId: '',
        //         userLogin: '',
        //     };
        newComment.commentatorInfo = {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin,
        };
        newComment.createdAt = new Date(comment.createdAt).toISOString();
        newComment.likesInfo = {
            likesCount: comment.likesInfo.likesCount,
            dislikesCount: comment.likesInfo.dislikesCount,
            myStatus: comment.likesInfo.myStatus,
        }

        return newComment;
    };
}