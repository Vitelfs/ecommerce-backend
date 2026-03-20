import { Injectable } from "@nestjs/common";
import { HashingServiceProtocol } from "./hashing.service";
import bcrypt from "node_modules/bcryptjs";


@Injectable()
export class BcryptService extends HashingServiceProtocol {
    compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
    hash(password: string): Promise<string> {
        const salt = 10;
        return bcrypt.hash(password, salt);
    }
}