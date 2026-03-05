import bcrypt from "bcrypt";
import { NeutronServer } from "../../NeutronServer";
import { User } from "../entities/User";

class Users {
    public static async createAccount(
        username: string,
        displayname: string,
        admin: boolean,
        password: string
    ) {
        const userRepo = NeutronServer.getInstance().database.dataSource.getRepository(User);

        const existing = await userRepo.findOne({ where: { username } });
        if (existing) {
            throw new Error(`User "${username}" already exists`);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = userRepo.create({
            username,
            displayname,
            admin,
            password: { password: passwordHash },
        });

        await userRepo.save(user);

        return user;
    }

    public static async getAccount_byUsername(username: string) {
        const userRepo = NeutronServer.getInstance().database.dataSource.getRepository(User);
        return await userRepo.findOne({ where: { username } });
    }

    public static async getAccount_byUUID(uuid: string) {
        const userRepo = NeutronServer.getInstance().database.dataSource.getRepository(User);
        return await userRepo.findOne({ where: { id: uuid } });
    }

    public static async getAccount_byRefreshToken(refreshToken: string) {
        const userRepo = NeutronServer.getInstance().database.dataSource.getRepository(User);
        return await userRepo.findOne({ where: { refresh_token: refreshToken } });
    }

    public static async updateAccount(user: User, data: Partial<User>) {
        const userRepo = NeutronServer.getInstance().database.dataSource.getRepository(User);
        await userRepo.update(user.id, data);
        return await userRepo.findOne({ where: { id: user.id } });
    }

    public static async deleteAccount(user: User) {
        const userRepo = NeutronServer.getInstance().database.dataSource.getRepository(User);
        await userRepo.delete(user.id);
    }

    public static async getAccounts() {
        const userRepo = NeutronServer.getInstance().database.dataSource.getRepository(User);
        return await userRepo.find();
    }

    public static async verifyPassword(user: User, password: string) {
        return await bcrypt.compare(password, <string>user.password?.password);
    }
}

export default Users;