import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailAlreadyExistException } from './exceptions/email-already-exist-exception';
import { hash, isHashValid } from '../common/encryption/hashing-hanlder';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const duplicatedEmailUser = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (duplicatedEmailUser) {
      throw new EmailAlreadyExistException();
    }
    const user = new User();
    user.email = createUserDto.email;
    user.password = await hash(createUserDto.password);
    user.userType = createUserDto.userType;
    const newUser = await this.userRepository.save(user);
    return newUser;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOneBy({ email: loginDto.email });
    if (user && isHashValid(loginDto.password, user.password)) {
      const payload = { id: user.id, email: loginDto.email };
      return this.jwtService.sign(payload);
    }
    throw new UnauthorizedException('인증되지 않은 사용자입니다.');
  }

  async findById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }
}
