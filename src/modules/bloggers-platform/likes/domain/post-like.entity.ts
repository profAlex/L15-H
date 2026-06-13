// {
//     // Мы не объявляем _id явно, Mongoose создаст его сам
//     postId: { type: String, required: true },
//     userId: { type: String, required: true },
//     userLogin: { type: String, required: true },
//     createdAt: {
//         type: Date,
//     default: Date.now,
//         // просто {type: Date, default: new Date()} нельзя!
//         // когда пишем код схемы, Node.js выполняет его один раз при старте приложения,
//         // чтобы создать объект Schema
//         // ВЫЗОВ ПРОИСХОДИТ ЗДЕСЬ И СЕЙЧАС, в момент старта приложения и запоминается как дефолтный
//         // нужно передавать ссылку на функцию либо Date.now либо () => new Date()
//     },
//     likeStatus: {
//         type: String,
//         enum: Object.values(LikeStatus),
//         required: true,
//         default: LikeStatus.None,
//     },
// },

import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
    ExtendedPostModel,
    ExtendedPostModelSchema,
} from '../../posts/domain/extended-post-model.schema';
import { CreatePostDomainDto } from '../../posts/domain/dto/create-post.domain.dto';
import { LikeStatus } from '../../../../core/enums/like-status.enum';
import { UpdatePostInputDto } from '../../posts/dto/create-post-input.dto';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class PostLike {
    @ApiProperty()
    @Prop({ type: String, required: true })
    postId!: string;

    @ApiProperty()
    @Prop({ type: String, required: true })
    userId!: string;

    @ApiProperty()
    @Prop({ type: String, required: true })
    userLogin!: string;

    createdAt!: Date;
    updatedAt!: Date;

    @Prop({ type: Date, nullable: true })
    deletedAt!: Date | null;

    @Prop({
        type: String,
        enum: LikeStatus,
    })
    likeStatus!: LikeStatus;

    get id(): string {
        // @ts-ignore
        return this._id.toString();
    }

    static createInstance(dto: CreatePostLikeDomainDto): PostLikeDocument {
        const { title, shortDescription, content, blogId, blogName } = dto;

        const newPostLike = new this();
        newPostLike.postId = shortDescription;
        newPostLike.userId = content;
        newPostLike.userLogin = title;

        newPostLike.createdAt = new Date();
        newPostLike.deletedAt = null;
        newPostLike.likeStatus = LikeStatus.None;

        return newPostLike as PostLikeDocument;
    }

    makeDeleted() {
        if (this.deletedAt !== null) {
            return;
        }
        this.deletedAt = new Date();
    }

    // "title": "string",
    // "shortDescription": "string",
    // "content": "string",
    // "blogId": "string"
    updatePost(dto: UpdatePostInputDto) {
        if (dto.title !== this.title) {
            this.title = dto.title;
        }
        if (dto.shortDescription !== this.shortDescription) {
            this.shortDescription = dto.shortDescription;
        }
        if (dto.content !== this.content) {
            this.content = dto.content;
        }
        if (dto.blogId !== this.blogId) {
            this.blogId = dto.blogId;
        }
    }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

//регистрирует методы сущности в схеме
PostLikeSchema.loadClass(PostLike);

//Типизация документа
export type PostLikeDocument = HydratedDocument<PostLike>;

//Типизация модели + статические методы
export type PostLikeModelType = Model<PostLikeDocument> & typeof PostLike;
