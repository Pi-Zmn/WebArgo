import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async create(user: User) {
    user.password = await bcrypt.hash(user.password, 4)
    const savedUser = await this.userRepository.save(user)
    return savedUser;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async update(id: number, updateUser: User) {
    const userToUpdate = await this.userRepository.findOneBy({ id });
    if (!userToUpdate) {
      return null;
    }
    userToUpdate.name = updateUser.name;
    userToUpdate.role = updateUser.role;
    userToUpdate.password = await bcrypt.hash(updateUser.password, 4);

    const savedUser = await this.userRepository.save(userToUpdate);
    return savedUser;
  }

  remove(id: number) {
    this.userRepository.delete(id);
  }

  /* Validate User Credentials and Return User if Match Found */
  async validateLogin(name: string, password: string) {
    const foundUser = await this.userRepository.findOneBy({ name });

    if (foundUser && await bcrypt.compare(password, foundUser.password)) {
      return foundUser;
    }
    return null;
  }

  /* Create JWT for Authentification */
  async getJWT(payload: UserDto) {
    return await this.jwtService.signAsync({ user: payload })
  }
}
