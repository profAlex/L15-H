import {ApiProperty} from "@nestjs/swagger";
import {CommentatorInfo} from "../commentator-info.schema";
import {LikesInfo} from "../likes-info.schema";

export class CreateCommentDomainInputDto{
    @ApiProperty()
    relatedPostId: string;

    @ApiProperty()
    content: string;

    @ApiProperty()
    commentatorInfo: CommentatorInfo;
}