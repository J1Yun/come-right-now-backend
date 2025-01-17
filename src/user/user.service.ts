import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserInfoDTO } from './dto/user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async findUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException('no user');
    }
    return user;
  }

  async getUserInfo(userId: string): Promise<UserInfoDTO> {
    const userInfo = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndMapOne('user.account', 'user.id', 'account')
      .select([
        'user.id',
        'user.name',
        'user.phone',
        'user.birthDate',
        'user.creditRate',
        'account.email',
      ])
      .where('user.id = :userId', { userId })
      .getOne();

    if (!userInfo) {
      throw new NotFoundException('no user');
    }

    const { id, name, phone, birthDate, creditRate, account } = userInfo;
    const userInfoData: UserInfoDTO = {
      id,
      email: account.email,
      name,
      phone,
      birthDate,
      creditRate,
    };

    return userInfoData;
  }

  async createUser(createUserDTO: CreateUserDTO) {
    const { name, phone, birthDate } = createUserDTO;

    const user = new User();
    user.id = createUserDTO.id;
    user.name = name;
    user.phone = phone;
    user.birthDate = birthDate;
    user.creditRate = 5;

    return await user.save();
  }
}
