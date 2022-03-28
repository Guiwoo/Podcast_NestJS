import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/users/entities/user.entity";

export type UserRoleType = keyof typeof UserRole | "Any"

export const Role = (roles: UserRoleType[]) => SetMetadata('roles', roles)