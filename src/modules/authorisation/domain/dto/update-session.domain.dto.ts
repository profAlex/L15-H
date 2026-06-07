import {Type} from "class-transformer";
import {IsDate} from "class-validator";

export class UpdateSessionDomainDto{
    // убеждаемся, что при получении данных из контроллера (через сеть) даты в UpdateSessionDomainDto действительно превращаются в объекты Date, а не остаются строками
    @Type(() => Date) // Принудительно превращает строку из JSON в объект Date
    @IsDate()
    issuedAt: Date;

    @Type(() => Date) // Принудительно превращает строку из JSON в объект Date
    @IsDate()
    expiresAt: Date;
}
