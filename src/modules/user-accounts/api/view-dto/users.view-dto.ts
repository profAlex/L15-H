import { UserDocument } from '../../domain/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  //firstName: string;
  //lastName: string | null;

  static mapToView(user: UserDocument): UserViewDto {
    const dto = new UserViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.id = user._id.toString();
    dto.createdAt = new Date(user.createdAt).toISOString();
    //dto.firstName = user.name.firstName;
    //dto.lastName = user.name.lastName;

    return dto;
  }
}
