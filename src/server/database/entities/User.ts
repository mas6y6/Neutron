import {Entity, Column, PrimaryGeneratedColumn, OneToOne} from "typeorm";
import {UserPassword} from "./UserPassword";
import {UserTOTP} from "./UserTOTP";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column()
    displayname!: string;

    @Column({ default: false })
    superadmin!: boolean;

    @Column({ default: false })
    admin!: boolean;

    @Column({ nullable: true })
    refresh_token!: string;

    // relations
    @OneToOne(() => UserPassword, password => password.user, { cascade: true })
    password?: UserPassword;

    @OneToOne(() => UserTOTP, totp => totp.user, { cascade: true })
    totp?: UserTOTP;
}