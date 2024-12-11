import { Controller, Get, Post, Body, Param, Delete, NotFoundException, Put, BadRequestException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { AdminGuard } from 'src/auth-guard/admin.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() newUser: User) {
    return this.userService.create(newUser).then((user) => {
      return new UserDto(user)
    });
  }

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.userService.findAll().then((users) => {
      return users.map((user) => new UserDto(user))
    });
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id).then((user) => {
      if (!user) {
        throw new NotFoundException();
      }
      return new UserDto(user)
    });
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUser: User) {
    return this.userService.update(+id, updateUser).then((user) => {
      if (!user) {
        throw new NotFoundException();
      }
      return new UserDto(user)
    });
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    this.userService.remove(+id);
    return `Deleted User #${+id}`;
  }

  @Post('login')
  async login(
    @Body('name') name: string,
    @Body('password') password: string,
  ) {
    const user = await this.userService.validateLogin(name, password)
    if (!user) {
      throw new BadRequestException('Invalid User Credentials!')
    } 

    return {
      access_token: await this.userService.getJWT(new UserDto(user))
    }
  }
}
