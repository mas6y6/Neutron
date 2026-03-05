import {Entity, Column, PrimaryColumn, JoinColumn, OneToOne} from "typeorm";
import {User} from "./User";

@Entity("users_totp")
export class UserTOTP {
    @PrimaryColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 64 })
    secret!: string;

    @OneToOne(() => User, user => user.totp)
    @JoinColumn({ name: "id" }) // link by same UUID
    user!: User;
}