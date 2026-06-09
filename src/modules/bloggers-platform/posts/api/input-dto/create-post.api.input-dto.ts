import { CreatePostInputDto } from '../../dto/create-post-input.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostApiInputDto extends CreatePostInputDto {
    @ApiProperty({ type: String, required: true })
    @IsString()
    @IsNotEmpty()
    blogId: string;
}
