import { Module } from '@nestjs/common';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsController } from './blogs/api/blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { Post, PostSchema } from './posts/domain/post.entity';
import { BlogsCommandRepository } from './blogs/infrastructure/blogs.command-repository';
import { PostsService } from './posts/application/posts.service';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostsCommandRepository } from './posts/infrastructure/posts.command-repository';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { PostsController } from './posts/api/posts.controller';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsService } from './comments/application/comments.service';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { CommentsCommandRepository } from './comments/infrastructure/comments.command-repository';
import { GetCommentsForSpecificPostIdHandler } from './comments/application/usecases/get-comments-for-specified-post-id.usecase';
import { GetAllPostsHandler } from './posts/application/usecases/get-all-posts.usecase';

//тут регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
    imports: [
        MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
        ]),

        UserAccountsModule,
    ],
    controllers: [BlogsController, PostsController, CommentsController],
    providers: [
        GetAllPostsHandler,
        GetCommentsForSpecificPostIdHandler,
        BlogsService,
        BlogsQueryRepository,
        BlogsCommandRepository,
        PostsService,
        PostsQueryRepository,
        PostsCommandRepository,
        CommentsService,
        CommentsQueryRepository,
        CommentsCommandRepository,
    ],
})
export class BloggersPlatformModule {}
