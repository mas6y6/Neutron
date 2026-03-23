import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity("user_store")
export class UserStore {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    type!: string;

    @Column("text")
    encryptedData!: string;

    @Column()
    userId!: string;

    @Column()
    sourceUserId!: string;

    @ManyToOne(() => User, user => user.stores, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;
}
