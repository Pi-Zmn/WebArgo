import { User, UserRole } from "../entities/user.entity";

export class UserDto {
    constructor(user: User) {
        this.id = user.id;
        this.name = user.name;
        this.role = user.role;
    }

    id: number;

    name: string;

    role: UserRole;
}
