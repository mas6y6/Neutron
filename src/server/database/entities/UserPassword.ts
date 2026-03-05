import {Entity, Column, PrimaryColumn, JoinColumn, OneToOne} from "typeorm";
import {User} from "./User";

@Entity("users_passwords")
export class UserPassword {
    @PrimaryColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 60 })
    password!: string;

    @OneToOne(() => User, user => user.password)
    @JoinColumn({ name: "id" })
    user!: User;
}