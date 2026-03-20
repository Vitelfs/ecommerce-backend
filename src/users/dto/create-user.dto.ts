import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { UserRole } from "../enum/user.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {

  @ApiProperty({
    description: 'User first name',
    example: 'João'
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'User second name (last name)',
    example: 'Silva'
  })
  @IsString()
  @IsNotEmpty()
  second_name: string;

  @ApiProperty({
    description: 'User email',
    example: 'joao@email.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User CPF (Brazilian document)',
    example: '12345678900'
  })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({
    description: 'User role in system',
    enum: UserRole,
    example: UserRole.ADMIN
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}