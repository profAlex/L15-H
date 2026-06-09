import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlogPostInputDto {
    @ApiProperty({ example: 'Title of the post' })
    @IsString()
    @IsNotEmpty()
    title: string = '';

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    shortDescription: string = '';

    @ApiProperty()
    @IsString()
    content?: string;
}
