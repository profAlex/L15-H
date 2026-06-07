import {ApiProperty} from "@nestjs/swagger";

export class CreateBlogDomainDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    websiteUrl: string;
}