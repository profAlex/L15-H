import {ApiProperty} from "@nestjs/swagger";
import {CommentatorInfo} from "../../domain/commentator-info.schema";
import {LikesInfo} from "../../domain/likes-info.schema";

export class CreateCommentApiInputDto{
    @ApiProperty()
    relatedPostId: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    commentatorInfo: CommentatorInfo;
}