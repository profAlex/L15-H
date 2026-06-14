import { ApiProperty } from '@nestjs/swagger';
import { LikeStatus } from '../../../../../core/enums/like-status.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangePostLikeStatusInputDto {
    @ApiProperty({
        enum: LikeStatus,
        description: 'Тип реакции пользователя на публикацию',
        example: LikeStatus.Like,
    })
    @IsNotEmpty()
    @IsEnum(LikeStatus, {
        message: `Статус лайка должен быть одним из следующих значений: ${Object.values(LikeStatus).join(', ')}`,
    })
    likeStatus!: LikeStatus;
}
