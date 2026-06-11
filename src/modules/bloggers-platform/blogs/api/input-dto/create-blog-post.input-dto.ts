import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBlogPostInputDto {
    @ApiProperty({ example: 'Title of the post' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    title: string = '';

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    shortDescription: string = '';

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content: string = '';
}
