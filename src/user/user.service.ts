import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput, CreateUserOutput } from './dto/createUser.dto';
import { LoginInput, LoginOutput } from './dto/loginUser.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userService: Repository<User>,
        private readonly jwtService: JwtService
    ) { }

    handleError(text: string) {
        return {
            ok: false,
            error: text,
        }
    }

    async createUser({ email, password, role }: CreateUserInput): Promise<CreateUserOutput> {
        try {
            const existCheck = await this.userService.findOne({ email })
            if (existCheck) {
                return this.handleError("This email has taken, Try use other email")
            }
            const newUser = this.userService.create({
                email,
                password,
                role
            })
            await this.userService.save(newUser)
            return {
                ok: true
            }
        } catch (error) {
            return this.handleError("Could not make an account !")
        }
    }

    async loginUser({ email, password }: LoginInput): Promise<LoginOutput> {
        try {
            const user = await this.userService.findOne({ email })
            if (!user) {
                return this.handleError("User Could not find ..")
            }
            const passwordChecking = await user.checkPassword(password)
            if (!passwordChecking) {
                return this.handleError("Password is wrong")
            }
            const token = this.jwtService.sign(user.id)
            return {
                ok: true,
                token
            }
        } catch (error) {
            return this.handleError("Could not Login with this email and password")
        }
    }
}
