import {Entity, Column, PrimaryColumn} from "typeorm";

@Entity("users_passwords")
export class UserPassword {
    @PrimaryColumn("uuid")
    id!: string;

    @Column({ type: "blob" })
    password!: Buffer;
}
