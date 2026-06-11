import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';
import request from 'supertest';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Comment } from '../src/modules/bloggers-platform/comments/domain/comment.entity';

describe('PostsController (e2e)', () => {
    let app: INestApplication;
    let commentModel: Model<any>; // Переменная для прямой работы с БД

    beforeAll(async () => {
        const testingAppModule: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = testingAppModule.createNestApplication();
        appSetup(app); // не забываем подключить глобальные префиксы, пайпы
        await app.init();

        // достаем модель комментариев напрямую из контейнера NestJS
        commentModel = app.get<Model<any>>(getModelToken(Comment.name));
    });

    afterAll(async () => {
        await request(app.getHttpServer()).delete('/testing/all-data');
        await app.close();
    });

    // Очищаем базу перед каждым тестом через специальный контроллер
    beforeEach(async () => {
        await request(app.getHttpServer()).delete('/testing/all-data');
    });

    it('GET /posts - should return 201 and paginated post list', async () => {
        // создание блога
        const createBlogResponse = await request(app.getHttpServer())
            .post('/blogs')
            .send({
                name: 'NodeJS Blog',
                description: 'Backend news',
                websiteUrl: 'https://nodejs.org',
            })
            .expect(201);

        const blog = createBlogResponse.body;
        // структура возвращаемого блога
        /*
        {
        "id": "69f629a4b705ee0b0e4b874e",
        "name": "NodeJS Blog",
        "description": "Backend news",
        "websiteUrl": "https://nodejs.org",
        "createdAt": "2026-05-02T16:43:16.921Z",
        "isMembership": true
        }
        */
        // создание поста для этого блога
        const createPostDto = {
            title: 'NestJS Testing',
            shortDescription: 'How to write e2e tests',
            content: 'Very long and useful content about supertest...',
        };

        const createPostResponse = await request(app.getHttpServer())
            .post(`/blogs/${blog.id}/posts`)
            .send(createPostDto)
            .expect(201);

        const createdPost = createPostResponse.body;

        // закомментированное относится к комментам, они не находятся непосредственно в ответе
        // const createCommentDto = {
        //     relatedPostId: createdPost.id,
        //     content: 'comment',
        //     commentatorInfo: {
        //         userId: 'some userId',
        //         userLogin: 'some login',
        //     },
        // };

        // // создаем коммент в посте createdPost.id
        // const createCommentResponse = await request(app.getHttpServer())
        //     .post(`/comments/`)
        //     .send(createCommentDto)
        //     .expect(201);
        //
        // // просто дополнительная проверка того, что размещение коммента отработало как надо
        // expect(createCommentResponse.body).toEqual({
        //     id: expect.any(String),
        //     content: "comment",
        //     commentatorInfo: {
        //         userId: "some userId",
        //         userLogin: "some login"
        //     },
        //     createdAt: expect.any(String),
        //     likesInfo: {
        //         likesCount: 0,
        //         dislikesCount: 0,
        //         myStatus: "None"
        //     }
        // });
        // console.log(createCommentResponse.body);

        const result = await request(app.getHttpServer())
            .get('/posts')
            .expect(200);

        expect(result.body).toEqual({
            totalCount: 1,
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            items: [
                {
                    id: expect.any(String),
                    title: 'NestJS Testing',
                    shortDescription: 'How to write e2e tests',
                    content: 'Very long and useful content about supertest...',
                    blogId: expect.any(String),
                    blogName: 'NodeJS Blog',
                    createdAt: expect.any(String),
                    extendedLikesInfo: {
                        likesCount: 0,
                        dislikesCount: 0,
                        myStatus: 'None',
                        newestLikes: [],
                    },
                },
            ],
        });
        // console.log(result.body);
    });

    it('POST /posts - should return 201 and created post', async () => {
        // создание блога
        const createBlogResponse = await request(app.getHttpServer())
            .post('/blogs')
            .send({
                name: 'NodeJS Blog',
                description: 'Backend news',
                websiteUrl: 'https://nodejs.org',
            })
            .expect(201);

        const blog = createBlogResponse.body;

        // структура возвращаемого блога
        /*
        {
        "id": "69f629a4b705ee0b0e4b874e",
        "name": "NodeJS Blog",
        "description": "Backend news",
        "websiteUrl": "https://nodejs.org",
        "createdAt": "2026-05-02T16:43:16.921Z",
        "isMembership": true
        }
        */

        // создание поста для этого блога
        const createPostDto = {
            title: 'NestJS Testing',
            shortDescription: 'How to write e2e tests',
            content: 'Very long and useful content about supertest...',
            blogId: blog.id,
        };

        const createPostResponse = await request(app.getHttpServer())
            .post(`/posts`)
            .send(createPostDto)
            .expect(201);

        // структура ответа с содержанием созданного поста
        // {
        //     "id": "6a09e013dc2fce1338ab466a",
        //     "title": "NestJS Testing",
        //     "shortDescription": "How to write e2e tests",
        //     "content": "Very long and useful content about supertest...",
        //     "blogId": "6a09e012dc2fce1338ab4666",
        //     "blogName": "NodeJS Blog",
        //     "createdAt": "2026-05-17T15:34:43.367Z",
        //     "extendedLikesInfo": {
        //     "likesCount": 0,
        //         "dislikesCount": 0,
        //         "myStatus": "None",
        //         "newestLikes": []
        // }
        // }

        expect(createPostResponse.body).toEqual({
            id: expect.any(String),
            title: 'NestJS Testing',
            shortDescription: 'How to write e2e tests',
            content: 'Very long and useful content about supertest...',
            blogId: expect.any(String),
            blogName: 'NodeJS Blog',
            createdAt: expect.any(String),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: [],
            },
        });
    });

    it('GET /posts/:postId/comments - should return 200 and paginated comments list', async () => {
        // 1. Создаем блог через HTTP
        const createBlogResponse = await request(app.getHttpServer())
            .post('/blogs')
            .send({
                name: 'Mongoose Tips',
                description: 'Database design tips',
                websiteUrl: 'https://mongoosejs.com',
            })
            .expect(201);

        const blog = createBlogResponse.body;

        // 2. Создаем пост через HTTP
        const createPostResponse = await request(app.getHttpServer())
            .post(`/blogs/${blog.id}/posts`)
            .send({
                title: 'CQRS Architecture',
                shortDescription: 'Using NestJS QueryBus',
                content: 'Let us query comments via QueryBus effectively...',
            })
            .expect(201);

        const post = createPostResponse.body;

        // 3. Напрямую пишем комментарий в базу данных через Mongoose Model
        // Структура объекта должна полностью соответствовать твоей Mongoose-схеме документа
        await commentModel.create({
            relatedPostId: post.id,
            content: 'This query bus approach is incredibly clean!',
            commentatorInfo: {
                userId: 'user123',
                userLogin: 'johndoe',
            },
            createdAt: new Date(),
            updatedAt: new Date(Date.now() + 30 * 1000),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                usersStatuses: [],
            },
            deletedAt: null,
        });

        // 4. Вызываем тестируемый эндпоинт, который внутри использует QueryBus
        const result = await request(app.getHttpServer())
            .get(`/posts/${post.id}/comments`)
            .query({ pageNumber: 1, pageSize: 10 })
            .expect(200);

        // 5. Проверяем, что QueryBus успешно достал из базы наш объект и отмаппил в ViewDto
        expect(result.body).toEqual({
            totalCount: 1,
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            items: [
                {
                    id: expect.any(String),
                    content: 'This query bus approach is incredibly clean!',
                    commentatorInfo: {
                        userId: 'user123',
                        userLogin: 'johndoe',
                    },
                    createdAt: expect.any(String),
                    likesInfo: {
                        likesCount: 0,
                        dislikesCount: 0,
                        myStatus: 'None',
                    },
                },
            ],
        });
    });
});
