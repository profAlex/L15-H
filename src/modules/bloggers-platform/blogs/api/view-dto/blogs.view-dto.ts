
//     _id: ObjectId;
//     id: string;
//     name: string;
//     description: string;
//     websiteUrl: string;
//     createdAt: Date;
//     isMembership: boolean;
import {BlogDocument} from "../../domain/blog.entity";

export class BlogViewDto {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: Date;
    isMembership: boolean;

    static mapToView(blog: any): BlogViewDto {
        return {
            id: blog._id ? blog._id.toString() : blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt instanceof Date
                ? blog.createdAt.toISOString()
                : blog.createdAt,
            isMembership: blog.isMembership
        };
    }
}