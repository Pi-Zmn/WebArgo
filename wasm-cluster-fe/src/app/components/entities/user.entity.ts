export enum UserRole {
    User,
    Admin
}

export interface User {
    id: number,
    name: string,
    role: UserRole
}
