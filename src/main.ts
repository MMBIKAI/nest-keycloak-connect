import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { KeycloakConfigService } from './config/keycloak-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use an environment variable for the host, defaulting to 0.0.0.0
  const port = process.env.PORT ?? 3006;
  const host = process.env.HOST ?? '0.0.0.0'; // '0.0.0.0' makes the app accessible externally

  await app.listen(port, host);
  console.log(`Application is running on http://${host}:${port}`);
}

bootstrap();
