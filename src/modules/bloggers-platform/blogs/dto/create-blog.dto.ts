import { IsNotEmpty, IsString } from 'class-validator';

export type CreateBlogDto = {
    name: string;
    description: string;
    websiteUrl: string;
};

export class UpdateBlogInputDto {
    @IsString()
    @IsNotEmpty()
    name: string = '';

    @IsString()
    @IsNotEmpty()
    description: string = '';

    @IsString()
    @IsNotEmpty()
    websiteUrl: string = '';
}
