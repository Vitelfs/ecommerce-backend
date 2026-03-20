import { UserRole } from '../../users/enum/user.enum';

export class CurrentUserDto {
    id: string;
    username: string;
    role: UserRole;
}