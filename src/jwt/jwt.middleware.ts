import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UserService } from "src/user/user.service";
import { JwtService } from "./jwt.service";

@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService,
        private readonly userServcie: UserService) { }
    async use(req: Request, res: Response, next: NextFunction) {
        if ("jwt" in req.headers) {
            const token = req.headers["jwt"]
            try {
                const decoded = this.jwtService.verify(token.toString())
                if (typeof decoded == "object" && decoded.id) {
                    const { user } = await this.userServcie.findById(decoded.id)
                    req['user'] = user
                }
            } catch (e) { }
        }
        next()
    }
}