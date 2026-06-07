import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";

export class RegistrationConfirmationInputDto {
    @ApiProperty()
    @IsString()
    code: string
}