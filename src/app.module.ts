import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  UseInterceptors,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuthorModule } from './author/author.module';
import { ChapterModule } from './chapter/chapter.module';
import { ComicModule } from './comic/comic.module';
import { CommentModule } from './comment/comment.module';
import { CryptedModule } from './crypted/crypted.module';
import { MailModule } from './mail/mail.module';
import { CachingModule } from './caching/caching.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EncryptResponseInterceptor } from './common/interceptors/encrypt.interceptor';

//@UseInterceptors(EncryptResponseInterceptor)
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URL_API),
    CloudinaryModule,
    AdminModule,
    UserModule,
    AuthModule,
    AuthorModule,
    ChapterModule,
    ComicModule,
    CommentModule,
    CryptedModule,
    MailModule,
    CachingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: EncryptResponseInterceptor,
    // },
  ],
})
export class AppModule {}
