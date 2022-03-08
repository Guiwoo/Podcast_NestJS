import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CreateUserInput, CreateUserOutput } from "./dto/createUser.dto";
import { LoginInput, LoginOutput } from "./dto/loginUser.dto";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";

@Resolver(of => User)
export class UserResolver {
    constructor(
        private readonly userService: UserService
    ) { }

    /** Mutation ^^ */
    @Mutation(returns => CreateUserOutput)
    createAccount(@Args("input") createUserInput: CreateUserInput): Promise<CreateUserOutput> {
        return this.userService.createUser(createUserInput)
    }

    @Mutation(returns => LoginOutput)
    login(@Args("input") loginInput: LoginInput): Promise<LoginOutput> {
        return this.userService.loginUser(loginInput)
    }
}
