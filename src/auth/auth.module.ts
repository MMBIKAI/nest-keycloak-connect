import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Greeting } from './greeting.entity';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { ConfigModule } from '../config/config.module';
import { KeycloakConfigService } from '../config/keycloak-config.service';
//import { TokenService } from '../guards/token.treat';
import { RoleGuard } from '../guards/role.guard';
import { AttributeGuard } from '../guards/attribute.guard';
import { TokenModule } from '../guards/token.module';

@Module({
  providers: [AuthService, RoleGuard, AttributeGuard],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([Greeting]),
    ConfigModule,
    TokenModule,
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigService,
      imports: [ConfigModule],
    }),
  ],
})
export class AuthModule {}
