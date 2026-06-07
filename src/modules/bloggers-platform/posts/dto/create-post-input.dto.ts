import {ApiProperty} from "@nestjs/swagger";

export class CreatePostInputDto {
    @ApiProperty({type: String, required: true})
    title: string;

    @ApiProperty({type: String, required: true})
    shortDescription: string;

    @ApiProperty({type: String, required: true})
    content: string;
}

// "title": "string",
// "shortDescription": "string",
// "content": "string",
// "blogId": "string"
export class UpdatePostInputDto {
    @ApiProperty({type: String, required: true})
    title: string;

    @ApiProperty({type: String, required: true})
    shortDescription: string;

    @ApiProperty({type: String, required: true})
    content: string;

    @ApiProperty({type: String, required: true})
    blogId: string;
}