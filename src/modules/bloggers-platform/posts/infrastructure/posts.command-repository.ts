import {Injectable} from "@nestjs/common";
import {BlogDocument} from "../../blogs/domain/blog.entity";
import {Post, PostDocument, PostModelType} from "../domain/post.entity";
import {InjectModel} from "@nestjs/mongoose";

@Injectable()
export class PostsCommandRepository {
    constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

    async save(post: PostDocument): Promise<void> {
        await post.save();
    }

    async findSinglePostById(sentPostId:string) : Promise<PostDocument | null> {
        return this.PostModel.findOne({_id: sentPostId, deletedAt: null});
    }
}