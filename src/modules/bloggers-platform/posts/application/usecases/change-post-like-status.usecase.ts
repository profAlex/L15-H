// <PostViewDto> - This type represents the command execution result
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { CreatePostApiInputDto } from '../../api/input-dto/create-post.api.input-dto';
import { CreatePost } from './create-post.usecase';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/query/blogs.query-repository';
import { PostsCommandRepository } from '../../infrastructure/posts.command-repository';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostLikeDto } from '../../dto/create-post-like.dto';
import {
    PostLike,
    PostLikeModelType,
} from '../../../likes/domain/post-like.entity';
import { PostLikesCommandRepository } from '../../../likes/infrastructure/post-likes.command-repostory';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostLikesQueryRepository } from '../../../likes/infrastructure/query/post-likes.query-repository';
import { UsersExternalQueryRepository } from '../../../../user-accounts/infrastructure/external-query/users.external-query-repository';

export class ChangePostLikeStatus extends Command<void> {
    constructor(public readonly dto: CreatePostLikeDto) {
        super();
    }
}

@CommandHandler(ChangePostLikeStatus)
export class ChangePostLikeStatusHandler implements ICommandHandler<ChangePostLikeStatus> {
    constructor(
        @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
        private postLikesCommandRepository: PostLikesCommandRepository,
        private postLikesQueryRepository: PostLikesQueryRepository,
        private postsCommandRepository: PostsCommandRepository,
        private postsQueryRepository: PostsQueryRepository,
        private usersExternalQueryRepository: UsersExternalQueryRepository,
    ) {
        // private readonly blogsQueryRepository: BlogsQueryRepository,
    }

    async execute({ dto }: ChangePostLikeStatus): Promise<void> {
        const { postId, userId, likeStatus } = dto;

        // проверяем что пост, которому пользователь меняет лайк-статус существует и сразу возращаем ссылку для работы
        const post =
            await this.postsCommandRepository.findSinglePostById(postId);
        if (!post) {
            // throw new NotFoundException("Post not found");
            throw new DomainException({
                code: DomainExceptionCode.PostNotFound,
                message: `Post not found`,
            });
        }

        // проверяем наличие реакции на пост в коллекции пост-лайков и если он существует сразу возвращаем документ для
        const previousReactionStatus =
            await this.postLikesCommandRepository.findSinglePostLikeByPostIdAndUserId(
                { postId, userId },
            );

        // находим данные юзера, который меняет реакицю, нам нужен будет от него userLogin
        const user =
            await this.usersExternalQueryRepository.getByIdOrNotFoundFail(
                userId,
            );

        // если прежней реакции не найдено и новая реакция не None
        if (previousReactionStatus === null && likeStatus !== 'None') {
            // создаем новый лайк в базе
            const newLikeDocument = this.PostLikeModel.createInstance({
                postId: postId,
                userId: userId,
                userLogin: user.login,
            });

            await this.postLikesCommandRepository.save(newLikeDocument);

            // добавляем реакцию в счетчик реакций в базе комментариев
            const ifAddReactionSuccessfull =
                await this.postsCommandRepository.addPostReaction({
                    sentPostId: postId,
                    newStatus: likeStatus,
                });

            if (!ifAddReactionSuccessfull) {
                throw new DomainException({
                    code: DomainExceptionCode.PostNotFound,
                    message: `Post not found`,
                });
            }
        }
        // если прежняя реакция найдена и она не равна вновь переданной
        else if (
            previousReactionResult !== null &&
            previousReactionResult.likeStatus !== sentLike
        ) {
            // дополнительное условие - если передали лайк = none - удалить запись из лайк репозитория,
            // не забыть вызвать nullifyReaction

            // если новая реакция это None, тогда надо удалить запись лайка в репозитории лайков и сбросить реакцию в комменте
            if (sentLike === 'None') {
                // запоминаем какая реакция была ранее проставлена юзером
                const previousReaction: LikeStatus =
                    previousReactionResult.likeStatus;

                const result =
                    await this.postsLikesCommandRepository.deletePostLikeById(
                        previousReactionResult._id,
                    );

                if (!result) {
                    return {
                        data: null,
                        statusCode: HttpStatus.InternalServerError,
                        statusDescription: `deleteOne() error inside PostsCommandRepository.likePostById`,

                        errorsMessages: [
                            {
                                field: 'if (!result)', // это служебная и от
                                message:
                                    'Unknown error inside const result = await this.postsLikesCommandRepository.deletePostLikeById',
                            },
                        ],
                    };
                }

                // делаем декремент счетчика лайка или дизлайка
                const ifNullifyingReactionSuccessfull =
                    await post.nullifyingPostReaction(
                        sentPostId,
                        previousReaction,
                    );

                if (!ifNullifyingReactionSuccessfull) {
                    return {
                        data: null,
                        statusCode: HttpStatus.InternalServerError,
                        statusDescription: `Saving reaction was not successfull for post ${sentPostId} inside PostsCommandService.likePostById.`,
                        errorsMessages: [
                            {
                                field: 'if(!ifSavingLikeSuccessful) inside PostsCommandService.likePostById', // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `Internal Server Error`,
                            },
                        ],
                    };
                }
                // если мы меняем реакцию на Like или Dislike (sentLike === "Like" или "Dislike")
            } else {
                // меняем реакцию в коллекции лайков на новую
                previousReactionResult.likeStatus = sentLike;

                const ifSavingLikeSuccessful =
                    await this.postsLikesCommandRepository.savePostLikeDocument(
                        previousReactionResult,
                    );

                if (!ifSavingLikeSuccessful) {
                    return {
                        data: null,
                        statusCode: HttpStatus.InternalServerError,
                        statusDescription: `Saving like was not successfull for post ${sentPostId} inside PostsCommandService.likePostById.`,
                        errorsMessages: [
                            {
                                field: 'if(!ifSavingLikeSuccessful) inside PostsCommandService.likePostById', // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `Internal Server Error`,
                            },
                        ],
                    };
                }

                // меняем реакцию в коллекции постов на новую
                const ifSwitchReactionSuccessfull =
                    await post.switchPostReaction(sentPostId, sentLike);

                if (!ifSwitchReactionSuccessfull) {
                    return {
                        data: null,
                        statusCode: HttpStatus.InternalServerError,
                        statusDescription: `Saving reaction was not successfull for post ${sentPostId} inside PostsCommandService.likePostById.`,
                        errorsMessages: [
                            {
                                field: 'if(!ifSavingLikeSuccessful) inside PostsCommandService.likePostById', // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `Internal Server Error`,
                            },
                        ],
                    };
                }
            }
        }

        // реакция изменена удачно
        // теперь обновляем последние три поста
        const refreshLastLikesstatus =
            await this.postsLikesCommandRepository.getLatestLikesForPost(
                sentPostId,
            );
        post.updateNewestLikes(refreshLastLikesstatus);
        const result = await this.postsCommandRepository.savePostData(post);

        if (!result) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: `Saving refreshed like info was not successfull for post ${sentPostId} inside PostsCommandService.likePostById.`,
                errorsMessages: [
                    {
                        field: 'if (!result) inside PostsCommandService.likePostById', // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: `Internal Server Error`,
                    },
                ],
            };
        }

        return {
            data: null,
            statusCode: HttpStatus.NoContent,
            statusDescription: '',
            errorsMessages: [
                {
                    field: '',
                    message: '',
                },
            ],
        };
    }
}

// async likePostById(
//     sentPostId: string,
//     sentUserId: string,
//     sentLike: LikeStatus,
// ): Promise<CustomResult> {
//
//     const post = await this.postsCommandRepository.getPostById(sentPostId);
//     if (!post) return {
//     data: null,
//     statusCode: HttpStatus.InternalServerError,
//     statusDescription: `Cannot find post with ID ${sentPostId} inside PostsCommandService.likePostById.`,
//     errorsMessages: [
//         {
//             field: "if (!post) inside PostsCommandService.likePostById.",
//             message: `Internal Server Error`,
//         },
//     ],
// };
//
// // проверяем наличие реакции на пост в коллекции пост-лайков
// const previousReactionResult =
//     await this.postsLikesCommandRepository.checkIfUserAlreadyReacted(
//         sentUserId,
//         sentPostId,
//     );
//
// // находим юзера, нам нужен будет от него userLogin
// const user = await this.usersCommandRepository.findUserByPrimaryKey(
//     new ObjectId(sentUserId),
// );
// if (!user) {
//     return {
//         data: null,
//         statusCode: HttpStatus.InternalServerError,
//         statusDescription: `Cannot find user with ID ${sentUserId} inside PostsCommandService.likePostById.`,
//         errorsMessages: [
//             {
//                 field: "if (!user) inside PostsCommandService.likePostById.",
//                 message: `Internal Server Error`,
//             },
//         ],
//     };
// }
//
// // если прежней реакции не найдено и новая реакция не None
// if (previousReactionResult === null && sentLike !== "None") {
//     const newLikeDocument: PostLikeDocument =
//         PostLikeModel.createNewPostLike(
//             sentPostId,
//             sentUserId,
//             user.login,
//             sentLike,
//         );
//
//     const ifSavingLikeSuccessful =
//         await this.postsLikesCommandRepository.savePostLikeDocument(
//             newLikeDocument,
//         );
//
//     if (!ifSavingLikeSuccessful) {
//         return {
//             data: null,
//             statusCode: HttpStatus.InternalServerError,
//             statusDescription: `Saving like was not successfull for post ${sentPostId} inside PostsCommandService.likePostById.`,
//             errorsMessages: [
//                 {
//                     field: "if(!ifSavingLikeSuccessful) inside PostsCommandService.likePostById.",
//                     message: `Internal Server Error`,
//                 },
//             ],
//         };
//     }
//
//     // добавляем реакцию в счетчик реакций в базе комментариев
//     const ifAddReactionSuccessfull =
//         await post.addPostReaction(
//             sentPostId,
//             sentLike,
//         );
//
//     if (!ifAddReactionSuccessfull) {
//         return {
//             data: null,
//             statusCode: HttpStatus.InternalServerError,
//             statusDescription: `Saving like was not successfull for post ${sentPostId} inside PostsCommandService.likePostById.`,
//             errorsMessages: [
//                 {
//                     field: "if(!ifAddReactionSuccessfull) inside PostsCommandService.likePostById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
//                     message: `Internal Server Error`,
//                 },
//             ],
//         };
//     }
// }
// // если прежняя реакция найдена и она не равна вновь переданной
// else if (
//     previousReactionResult !== null &&
//     previousReactionResult.likeStatus !== sentLike
// ) {
//     // дополнительное условие - если передали лайк = none - удалить запись из лайк репозитория,
//     // не забыть вызвать nullifyReaction
//
//     // если новая реакция это None, тогда надо удалить запись лайка в репозитории лайков и сбросить реакцию в комменте
//     if (sentLike === "None") {
//
//         // запоминаем какая реакция была ранее проставлена юзером
//         const previousReaction: LikeStatus =
//             previousReactionResult.likeStatus;
//
//         const result =
//             await this.postsLikesCommandRepository.deletePostLikeById(
//                 previousReactionResult._id,
//             );
//
//         if (!result) {
//             return {
//                 data: null,
//                 statusCode: HttpStatus.InternalServerError,
//                 statusDescription: `deleteOne() error inside PostsCommandRepository.likePostById`,
//
//                 errorsMessages: [
//                     {
//                         field: "if (!result)", // это служебная и от
//                         message:
//                             "Unknown error inside const result = await this.postsLikesCommandRepository.deletePostLikeById",
//                     },
//                 ],
//             };
//         }
//
//         // делаем декремент счетчика лайка или дизлайка
//         const ifNullifyingReactionSuccessfull =
//             await post.nullifyingPostReaction(
//                 sentPostId,
//                 previousReaction,
//             );
//
//         if (!ifNullifyingReactionSuccessfull) {
//             return {
//                 data: null,
//                 statusCode: HttpStatus.InternalServerError,
//                 statusDescription: `Saving reaction was not successfull for post ${sentPostId} inside PostsCommandService.likePostById.`,
//                 errorsMessages: [
//                     {
//                         field: "if(!ifSavingLikeSuccessful) inside PostsCommandService.likePostById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
//                         message: `Internal Server Error`,
//                     },
//                 ],
//             };
//         }
//         // если мы меняем реакцию на Like или Dislike (sentLike === "Like" или "Dislike")
//     } else {
//
//         // меняем реакцию в коллекции лайков на новую
//         previousReactionResult.likeStatus = sentLike;
//
//         const ifSavingLikeSuccessful =
//             await this.postsLikesCommandRepository.savePostLikeDocument(
//                 previousReactionResult,
//             );
//
//         if (!ifSavingLikeSuccessful) {
//             return {
//                 data: null,
//                 statusCode: HttpStatus.InternalServerError,
//                 statusDescription: `Saving like was not successfull for post ${sentPostId} inside PostsCommandService.likePostById.`,
//                 errorsMessages: [
//                     {
//                         field: "if(!ifSavingLikeSuccessful) inside PostsCommandService.likePostById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
//                         message: `Internal Server Error`,
//                     },
//                 ],
//             };
//         }
//
//         // меняем реакцию в коллекции постов на новую
//         const ifSwitchReactionSuccessfull =
//             await post.switchPostReaction(
//                 sentPostId,
//                 sentLike,
//             );
//
//         if (!ifSwitchReactionSuccessfull) {
//             return {
//                 data: null,
//                 statusCode: HttpStatus.InternalServerError,
//                 statusDescription: `Saving reaction was not successfull for post ${sentPostId} inside PostsCommandService.likePostById.`,
//                 errorsMessages: [
//                     {
//                         field: "if(!ifSavingLikeSuccessful) inside PostsCommandService.likePostById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
//                         message: `Internal Server Error`,
//                     },
//                 ],
//             };
//         }
//     }
// }
//
// // реакция изменена удачно
// // теперь обновляем последние три поста
// const refreshLastLikesstatus = await this.postsLikesCommandRepository.getLatestLikesForPost(sentPostId);
// post.updateNewestLikes(refreshLastLikesstatus);
// const result = await this.postsCommandRepository.savePostData(post);
//
// if (!result) {
//     return {
//         data: null,
//         statusCode: HttpStatus.InternalServerError,
//         statusDescription: `Saving refreshed like info was not successfull for post ${sentPostId} inside PostsCommandService.likePostById.`,
//         errorsMessages: [
//             {
//                 field: "if (!result) inside PostsCommandService.likePostById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
//                 message: `Internal Server Error`,
//             },
//         ],
//     };
// }
//
// return {
//     data: null,
//     statusCode: HttpStatus.NoContent,
//     statusDescription: "",
//     errorsMessages: [
//         {
//             field: "",
//             message: "",
//         },
//     ],
// };
// }
