import { DynamicModule, Global, Module } from '@nestjs/common';
import { JWT_CONFIG_OPTION } from './jwt.const';
import { JwtModuleOptions } from './jwt.interface';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
    static forRoot(option: JwtModuleOptions): DynamicModule {
        return {
            module: JwtModule,
            exports: [JwtService],
            providers: [{
                provide: JWT_CONFIG_OPTION,
                useValue: option
            }, JwtService]
        }
    }
}
