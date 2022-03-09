import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput, CreateUserOutput } from './dto/createUser.dto';
import { LoginInput, LoginOutput } from './dto/loginUser.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { UpdateUserInput, UpdateUserOutput } from './dto/updateUser.dto';
import { MeOutput } from './dto/me.dto';

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

    async findById(id: number): Promise<MeOutput> {
        try {
            const user = await this.userService.findOne({ id })
            if (!user) {
                throw Error
            }
            return {
                ok: true,
                user
            }
        } catch (e) {
            return this.handleError("User Could not Found")
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

    async updateUser(userId: number, { email, password }: UpdateUserInput): Promise<UpdateUserOutput> {
        try {
            const user = await this.userService.findOne({ id: userId })
            if (email) {
                user.email = email
            }
            if (password) {
                user.password = password
            }
            await this.userService.save(user)
            return {
                ok: true,
            }
        } catch (error) {
            console.log(error)
            return this.handleError("Counld not update User with this inforamtions")
        }
    }
}
