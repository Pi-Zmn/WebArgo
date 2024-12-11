import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
    User,
    Admin
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    role: UserRole;

    @Column()
    password: string;
}