import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostInputDto {
    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    title: string = ''; // Инициализируем пустой строкой

    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    shortDescription: string = '';

    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
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
