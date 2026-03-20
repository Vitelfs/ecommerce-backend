import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from './enum/user.enum';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    private readonly bcrypt: HashingServiceProtocol,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  private randomSuffix(length = 4) {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  private async generateFirstPassword(cpf: string, name: string): Promise<string> {
    const firstCpfDigits = cpf.substring(0, 3).toLowerCase();
    const firstnameDigits = name.substring(0, 3).toLowerCase();

    const passToHash = `${firstCpfDigits}@${firstnameDigits}@${this.randomSuffix()}`;
    return this.bcrypt.hash(passToHash);
  }

  private async ensureUserExist(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  private async ensureEmailNotInUse(email: string): Promise<void> {
    const inUse = await this.userRepository.findOneBy({ email });
    if (inUse) throw new ConflictException('Email already in use.');
  }

  private async ensureUserIsAdmin(id: string): Promise<void> {
    const user = await this.ensureUserExist(id);
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      return;
    }
    throw new UnauthorizedException('User doesnt have the right')
  }

  async create(currentUser: string, createUserDto: CreateUserDto): Promise<User> {
    await this.ensureUserIsAdmin(currentUser);
    await this.ensureEmailNotInUse(createUserDto.email);
    const password = await this.generateFirstPassword(
      createUserDto.cpf,
      createUserDto.first_name,
    );
    const user = this.userRepository.create({
      ...createUserDto,
      password,
    });
    this.logger.log("New user create: ", user.first_name)
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.ensureUserExist(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.ensureUserExist(id);
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.ensureEmailNotInUse(updateUserDto.email);
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.ensureUserExist(id);
    await this.userRepository.remove(user);
  }
}
