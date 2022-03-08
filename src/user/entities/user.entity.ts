import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/core/entities/core.entity";
import { BeforeInsert, Column, Entity } from "typeorm";
import * as bcrypt from "bcrypt"
import { IsEnum, IsString } from "class-validator";
import { InternalServerErrorException } from "@nestjs/common";

enum UserRole {
    Host = "host",
    Listener = "listener"
}

registerEnumType(UserRole, { name: "UserRole" })

@InputType("UserInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {

    @Field(types => String)
    @Column()
    @IsString()
    email: string

    @Field(types => String)
    @Column()
    password: string

    @Field(types => UserRole, { defaultValue: UserRole.Listener })
    @Column({
        type: "simple-enum",
        enum: UserRole,
        default: UserRole.Listener
    })
    @IsEnum(UserRole)
    role: UserRole

    @BeforeInsert()
    async hashingPassword() {
        try {
            this.password = await bcrypt.hash(this.password, 10)
        }
        catch (e) {
            console.log(e)
            throw new InternalServerErrorException()
        }
    }

    async checkPassword(aPassword: string) {
        try {
            const ok = await bcrypt.compare(aPassword, this.password)
            return ok
        } catch (e) {
            console.log(e)
            throw new InternalServerErrorException()
        }
    }

}