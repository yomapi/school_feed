import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { Payload } from './jwt.paylod';
import { JWT_CONSTANTS } from '../jwt/constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_CONSTANTS.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: Payload) {
    const user = await this.userService.findById(payload.id);
    if (user) {
      return user; // request.user에 user 넣어줌
    } else {
      throw new UnauthorizedException('접근 오류');
    }
  }
}
