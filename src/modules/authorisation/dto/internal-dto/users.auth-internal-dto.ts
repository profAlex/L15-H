import {User, UserDocument} from "../../../user-accounts/domain/user.entity";
import {Require_id} from "mongoose";

export class UserAuthInternalDto
{
    id: string;
    email: string;
    passwordHash: string;
    login: string;
    isEmailConfirmed: boolean;
    deletedAt: Date | null;
    name: {firstName: string; lastName: string | null};

    static mapToView(user: Require_id<User>): UserAuthInternalDto{
        const newDtoUser = new UserAuthInternalDto();

        newDtoUser.id = user._id.toString();
        newDtoUser.email = user.email;
        newDtoUser.passwordHash = user.passwordHash;
        newDtoUser.login = user.login;
        newDtoUser.isEmailConfirmed = user.isEmailConfirmed;
        newDtoUser.deletedAt = user.deletedAt;
        newDtoUser.name = {
            firstName: user.name?.firstName ?? '',
            lastName: user.name?.lastName ?? null,
        }

        return newDtoUser;
    };
}
