import {FlattenMaps} from "mongoose";
import {UserDocument} from "../../../user-accounts/domain/user.entity";

export class MeViewDto {
    email: string;
    login: string;
    userId: string;

    static mapToView(userDto: FlattenMaps<UserDocument>): MeViewDto {
        return {
            email: userDto.email,
            login: userDto.login,
            userId: userDto._id.toString(),
        }
    }
}