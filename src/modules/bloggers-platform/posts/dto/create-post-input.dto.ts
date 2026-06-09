import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostInputDto {
    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
    title: string = ''; // Инициализируем пустой строкой

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    shortDescription: string = '';

    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
    content: string = '';
}

// "title": "string",
// "shortDescription": "string",
// "content": "string",
// "blogId": "string"
export class UpdatePostInputDto {
    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
    title: string = '';

    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
    shortDescription: string = '';

    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
    content: string = '';

    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
    blogId: string = '';
}
