import { UserRole } from '../enum/user.enum';

export class UserResponseDto {
  id: string;
  first_name: string;
  second_name: string;
  email: string;
  cpf: string;
  avatar: string | null;
  role: UserRole;
}
