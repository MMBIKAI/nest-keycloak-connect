import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Greeting } from './auth/greeting.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  //AuthGuard,
  KeycloakConnectModule,
  //RoleGuard,
  //ResourceGuard,
  //RoleGuard,
} from 'nest-keycloak-connect';
import { KeycloakConfigService } from './config/keycloak-config.service';
import { ConfigModule } from './config/config.module';
//import { APP_GUARD } from '@nestjs/core';
//import { TypeOrmModule } from '@nestjs/typeorm';
//import { Greeting } from './auth/greeting.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'sqlite', // Or 'postgres', 'sqlite', etc., depending on your database
      database: '/data/data.db',
      entities: [Greeting],
      synchronize: true, // Set to false in production
    }),
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigService,
      imports: [ConfigModule],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    //{
    //  provide: APP_GUARD,
    //  useClass: AuthGuard,
    //},
    //{
    //  provide: APP_GUARD,
    //  useClass: ResourceGuard,
    //},
    //{
    //  provide: APP_GUARD,
    //  useClass: RoleGuard,
    //},
  ],
})
export class AppModule {}
