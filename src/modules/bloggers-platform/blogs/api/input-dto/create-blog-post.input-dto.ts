import {ApiProperty} from "@nestjs/swagger";

export class CreateBlogPostInputDto{
    @ApiProperty({ example: 'Title of the post' })
    title: string;

    @ApiProperty()
    shortDescription: string;

    @ApiProperty()
    content: string;
}