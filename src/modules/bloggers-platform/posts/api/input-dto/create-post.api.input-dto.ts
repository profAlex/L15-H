import {CreatePostInputDto} from "../../dto/create-post-input.dto";

export class CreatePostApiInputDto extends CreatePostInputDto {
    blogId: string;
}