import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/auth/decorators/get-user.decorator';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@ApiTags('Usersz')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user in the system (Admins or SuperAdmins only)',
  })
  create(@CurrentUser() cuser: CurrentUserDto, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(cuser.id, createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all users',
    description: 'Retrieve a paginated list of all users (Admins or SuperAdmins only)',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single user',
    description: 'Retrieve information for a specific user by ID',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
    description: 'Update details for a specific user by ID',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove a user',
    description: 'Delete a specific user by ID',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
