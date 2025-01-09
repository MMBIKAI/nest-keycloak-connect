import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Greeting } from '../src/auth/greeting.entity';

describe('AuthController - get all messages (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './data/data.db', // Use a separate test database file
          entities: [Greeting],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return all messages (GET)', async () => {
    return request(app.getHttpServer())
      .get('/auth/messages')
      .query({ site: 'MERIGNAC', root: 'OU=OU-EMI,OU=OU-FONCTIONNEL' })
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzYXZiR092QkRUV0ljSXQ4LXNGM2tOWmpoUjdxdk5ycmZFUUtoNldWUm1jIn0.eyJleHAiOjE3MzY0MTc3NzEsImlhdCI6MTczNjQxNzQ3MSwianRpIjoiNWIwNDk2MzAtODQyNS00YmRkLWE2ODEtNmJlOTZjYjlmM2NkIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjEuMzc6ODA4MC9yZWFsbXMvbmVzdC1yZWFsbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjYzQwOTNjMC1kMGEyLTQ1OGMtYTNjOC1iZmM5YjA1ZmJhMjciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJncmVldGluZy1hcHAiLCJzZXNzaW9uX3N0YXRlIjoiMzBmOTFjM2UtZDc2Ny00ZDdjLTk3NGItMDg3YmUzYTMzOGY4IiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtbmVzdC1yZWFsbSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiZ3JlZXRpbmctYXBwIjp7InJvbGVzIjpbIm1hbmFnZXJfcm9sZSJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiMzBmOTFjM2UtZDc2Ny00ZDdjLTk3NGItMDg3YmUzYTMzOGY4Iiwic2l0ZSI6Ik1FUklHTkFDIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvb3QiOiJDTj1Nb2hhbmFkIEJJS0FJLE9VPU9VLVVUSUxJU0FURVVSUyxPVT1PVS1FTUksT1U9T1UtRk9OQ1RJT05ORUwsT1U9T1UtTUVSSUdOQUMsREM9Z2VzdGZvcm0sREM9Zm9uY3Rpb25uZWwiLCJuYW1lIjoiYmFzaWMgdXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImdyZWV0aW5nLW1hbmFnZXIiLCJpZCI6ImRkYzk1OWZkLWIxOGEtNGQ0NS05NTZhLWFlZTY2ZGQ4YmVlMSIsImdpdmVuX25hbWUiOiJiYXNpYyIsImZhbWlseV9uYW1lIjoidXNlciIsImVtYWlsIjoidGVzdHVzZXJAZXhhbXBsZS5jb20ifQ.WAkCrXguI0q2ZQb9jx7Jwrhhf1QcfR9Dgu0cUfJVBRHi9_rSByGN2MDQTJIVQK1leEJsDh9TbbqEUyeApV8ioH9ar6xii8dgt-2pzxMInTFjJvxNl7jpFc-AGIioIDQhzMajLDM547kQR2CXh6x0u8Z1BUKKKw2xgIcV-kXYaocG_Yjpqy_DIKdLi448-2Mgz5AKTfiLohml8da_tNQIIJO7q0T8QqIczO80AlilqJTRSzpWqjGAR8R0FXxLpySmns7-NfN9KjPcujg4DsPvgpJRknPNCjzw293_78SE0Pg10HnQO2QxEEjgLccMTXLzEAg4heHhmY0mC5-XX6z0vg',
      ) // Authorization header
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0); // Check for non-empty response
      });
  });
});
