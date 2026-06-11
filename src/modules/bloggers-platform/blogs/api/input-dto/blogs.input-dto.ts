import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

export class CreateBlogInputDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(15)
    name: string = '';

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    description: string = '';

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @Matches(
        /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
        {
            message: 'websiteUrl must be a valid https URL',
        },
    )
    websiteUrl: string = '';
}
