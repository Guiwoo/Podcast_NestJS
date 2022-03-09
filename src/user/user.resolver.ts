import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthGuard } from "src/authorization/auth.guard";
import { AuthUser } from "src/authorization/authUser.decorator";
import { CreateUserInput, CreateUserOutput } from "./dto/createUser.dto";
import { LoginInput, LoginOutput } from "./dto/loginUser.dto";
import { MeOutput } from "./dto/me.dto";
import { UpdateUserInput, UpdateUserOutput } from "./dto/updateUser.dto";
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

    @Mutation(returns => UpdateUserOutput)
    @UseGuards(AuthGuard)
    updateUser(@AuthUser() user: User, @Args("input") updateUserInput: UpdateUserInput): Promise<UpdateUserOutput> {
        return this.userService.updateUser(user.id, updateUserInput)
    }


    /** Query */
    @Query(returns => MeOutput)
    @UseGuards(AuthGuard)
    me(@AuthUser() user: User): Promise<MeOutput> {
        return this.userService.findById(user.id)
    }
}
