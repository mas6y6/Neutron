import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

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
}
