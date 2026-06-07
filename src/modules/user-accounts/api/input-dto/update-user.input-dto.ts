import { UpdateUserDto } from '../../dto/create-user.dto';
import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class UpdateUserInputDto implements UpdateUserDto {
  @ApiProperty()
  @IsString()
  email: string;
}
