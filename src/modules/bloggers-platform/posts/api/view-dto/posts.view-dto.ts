// post entity structure for reference:
// export type PostStorageModel = {
//     _id: ObjectId;
//     id: string;
//     title: string;
//     shortDescription: string;
//     content: string;
//     blogId: string;
//     blogName: string;
//     createdAt: Date;
//     extendedLikesInfo: ExtendedPostViewModel;
// };
//
// export type ExtendedPostViewModel = {
//     likesCount: number;
//     dislikesCount: number;
//     myStatus: LikeStatus;
//     newestLikes: LikeDetailsViewModel[];
// }
//
// export type LikeDetailsViewModel = {
//     addedAt: string;
//     userId: string;
//     login: string;
// };

import {ExtendedPostModel} from "../../domain/extended-post-model.schema";
import {LikeStatus} from "../../../../../core/enums/like-status.enum";
import {Post} from "../../domain/post.entity";
import {FlattenMaps, Types} from "mongoose";

export class PostViewDto {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string; // Обычно на выход отдаем строку ISO
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: LikeStatus;
        newestLikes: {
            addedAt: string;
            userId: string;
            login: string;
        }[];
    };

    //TODO: сделать FlattenMaps и для блога, проверить что там это есть
    // FlattenMaps дает совместимость с .lean(), т.к. внутри lean-документа уже нет никаких
    // специальных методов и типов, присущих hydrated-документу mongoose
    static mapToView(post: FlattenMaps<Post> & { _id: Types.ObjectId }): PostViewDto {
        const newPost = new PostViewDto();

        newPost.id = post._id.toString();
        newPost.title = post.title;
        newPost.shortDescription = post.shortDescription;
        newPost.content = post.content;
        newPost.blogId = post.blogId;
        newPost.blogName = post.blogName;
        newPost.createdAt = new Date(post.createdAt).toISOString(); // Мы принудительно оборачиваем в new Date(), чтобы метод точно существовал, т.к. внутрь сюда будут передавать ппосле lean
        // {...} или ручное перечисление, чтобы создать новый объект и не зависеть от оригинального объекта из Mongoose.
        // простые поля скопированные напрямую не передают ссылки на исходный обьект,
        // а сложные структуры (объекты и массивы) пересобираем заново.
        // Это гарантирует, что PostViewDto — это абсолютно независимый снимок данных,
        // который можно безопасно отправлять фронту
        newPost.extendedLikesInfo = {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            myStatus: post.extendedLikesInfo.myStatus,

            newestLikes: post.extendedLikesInfo.newestLikes.map(like => ({
                addedAt: like.addedAt,
                userId: like.userId,
                login: like.login
            }))
        };

        return newPost;
    }
}