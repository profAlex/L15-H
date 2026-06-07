import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {Injectable} from "@nestjs/common";
import {UserContextDto} from "../dto/user-context.dto";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'access-token-secret', //TODO: move to env. will be in the following lessons
        });
    };

    async validate(userData: UserContextDto): Promise<UserContextDto> {
        return userData;
    }

}


