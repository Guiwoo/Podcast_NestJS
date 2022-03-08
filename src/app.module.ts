import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { PodcastsModule } from './podcast/podcasts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Podcast } from './podcast/entities/podcast.entity';
import { Episode } from './podcast/entities/episode.entity';
import { UserModule } from './user/user.module';
import { CoreModule } from './core/core.module';
import { User } from './user/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite3',
      synchronize: true,
      logging: true,
      entities: [Podcast, Episode, User],
    }),
    GraphQLModule.forRoot({ autoSchemaFile: true }),
    JwtModule.forRoot({
      SECRET_KEY: "HouuuuPodCast"
    }),
    UserModule,
    PodcastsModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
