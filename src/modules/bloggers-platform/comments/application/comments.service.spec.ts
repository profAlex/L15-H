import {CommentsService} from "./comments.service";
import {PostsQueryRepository} from "../../posts/infrastructure/query/posts.query-repository";
import {CommentsQueryRepository} from "../infrastructure/query/comments.query-repository";
import {Test, TestingModule} from "@nestjs/testing";
import {GetCommentsQueryParams} from "../api/input-dto/get-comments-query-params.input-dto";
import {CommentsSortBy} from "../api/input-dto/comments-sort-by";
import {PaginatedViewDto} from "../../../../core/dto/base.paginated.view-dto";
import {CommentViewDto} from "../api/view-dto/comments.view-dto";
import {NotFoundException} from "@nestjs/common";

describe('CommentsService', () => {
    let service: CommentsService;

    const mockPostsQueryRepository = {
        ifPostExists: jest.fn(),
    };

    const mockCommentsQueryRepository = {
        getCommentsByPostId: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsService,
                {
                    provide: PostsQueryRepository,
                    useValue: mockPostsQueryRepository,
                },
                {
                    provide: CommentsQueryRepository,
                    useValue: mockCommentsQueryRepository
                },
            ]
        }).compile();

        service = module.get<CommentsService>(CommentsService);

        jest.clearAllMocks();
    });

    it('getCommentsByPostId should find all comments relate4d to the post and return them in paginated format', async () => {
        const fakePostId = 'somePostId';
        const fakeUserId = 'someUserId';
        const fakeQuery: GetCommentsQueryParams = new GetCommentsQueryParams();
        fakeQuery.pageSize = 10;
        fakeQuery.pageNumber = 1;

        const expectedResult = {
            totalCount: 1,
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            items: []
        };

        mockPostsQueryRepository.ifPostExists.mockResolvedValue(true);
        mockCommentsQueryRepository.getCommentsByPostId.mockResolvedValue(expectedResult);

        const result = await service.getCommentsByPostId({
            userId: fakeUserId,
            postId: fakePostId,
            query: fakeQuery
        });

        expect(mockPostsQueryRepository.ifPostExists).toHaveBeenCalledWith(fakePostId);

        expect(result).toEqual(expectedResult);
        expect(result).toHaveProperty('items');
        expect(result).toHaveProperty('totalCount');
    });


    it('getCommentsByPostId should fail due to absent postId', async () => {
        const fakePostId = 'somePostId';
        const fakeUserId = 'someUserId';
        const fakeQuery: GetCommentsQueryParams = new GetCommentsQueryParams();
        fakeQuery.pageSize = 10;
        fakeQuery.pageNumber = 1;

        const expectedResult = {
            totalCount: 1,
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            items: []
        };

        mockPostsQueryRepository.ifPostExists.mockResolvedValue(false);
        mockCommentsQueryRepository.getCommentsByPostId.mockResolvedValue(expectedResult);

        await expect(service.getCommentsByPostId({
            userId: fakeUserId,
            postId: fakePostId,
            query: fakeQuery
        })).rejects.toThrow(NotFoundException);

        expect(mockPostsQueryRepository.ifPostExists).toHaveBeenCalledWith(fakePostId);
        expect(mockCommentsQueryRepository.getCommentsByPostId).not.toHaveBeenCalled();
    });

});