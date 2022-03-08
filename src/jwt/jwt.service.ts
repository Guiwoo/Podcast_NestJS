import { Inject, Injectable } from '@nestjs/common';
import { JWT_CONFIG_OPTION } from './jwt.const';
import { JwtModuleOptions } from './jwt.interface';
import * as jwt from "jsonwebtoken"

@Injectable()
export class JwtService {
    constructor(
        @Inject(JWT_CONFIG_OPTION) private readonly option: JwtModuleOptions
    ) { }
    sign(userId: number): string {
        return jwt.sign({ id: userId }, this.option.SECRET_KEY)
    }
}
