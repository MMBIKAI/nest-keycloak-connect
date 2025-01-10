import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Greeting } from '../src/auth/greeting.entity';

describe('AuthController - get messages by id (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'src/nest-test-db/data.db', // Use a separate test database file
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

  it('should return a message by ID (GET)', async () => {
    const messageLang = 'french';

    return request(app.getHttpServer())
      .get(`/auth/${messageLang}`)
      .query({ site: 'MERIGNAC', root: 'OU=OU-EMI,OU=OU-FONCTIONNEL' })
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzYXZiR092QkRUV0ljSXQ4LXNGM2tOWmpoUjdxdk5ycmZFUUtoNldWUm1jIn0.eyJleHAiOjE3MzY0MjY1NzUsImlhdCI6MTczNjQyNjI3NSwianRpIjoiNzBiMWRiZDAtNWY3ZC00YWZjLTg5ZWEtZTI5NTNjM2EwYzBkIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjEuMzc6ODA4MC9yZWFsbXMvbmVzdC1yZWFsbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjYzQwOTNjMC1kMGEyLTQ1OGMtYTNjOC1iZmM5YjA1ZmJhMjciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJncmVldGluZy1hcHAiLCJzZXNzaW9uX3N0YXRlIjoiNDI0ZTQxYTUtM2I4My00MDQyLWFkNTgtYTUzNzY2N2U2NmJmIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtbmVzdC1yZWFsbSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiZ3JlZXRpbmctYXBwIjp7InJvbGVzIjpbIm1hbmFnZXJfcm9sZSJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiNDI0ZTQxYTUtM2I4My00MDQyLWFkNTgtYTUzNzY2N2U2NmJmIiwic2l0ZSI6Ik1FUklHTkFDIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvb3QiOiJDTj1Nb2hhbmFkIEJJS0FJLE9VPU9VLVVUSUxJU0FURVVSUyxPVT1PVS1FTUksT1U9T1UtRk9OQ1RJT05ORUwsT1U9T1UtTUVSSUdOQUMsREM9Z2VzdGZvcm0sREM9Zm9uY3Rpb25uZWwiLCJuYW1lIjoiYmFzaWMgdXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImdyZWV0aW5nLW1hbmFnZXIiLCJpZCI6ImRkYzk1OWZkLWIxOGEtNGQ0NS05NTZhLWFlZTY2ZGQ4YmVlMSIsImdpdmVuX25hbWUiOiJiYXNpYyIsImZhbWlseV9uYW1lIjoidXNlciIsImVtYWlsIjoidGVzdHVzZXJAZXhhbXBsZS5jb20ifQ.OgQIKb4kA2Z9LIfklLVDf8j5rshyVwr8_xUNF7t94VohFdjpITH6K4lJye4blhsMwGdepIvzwwbXdeXEn_McBypAnEkxMPqOlfd9fYLPRw-z6tcSXTEJ0cub1tY2-KmFHMxTjZ7z6LQeSMSrxYTq81kC-MLn3eDTVlvy0j8Zt06gALpQassryFP4BW4kHrhtrfugye_NiZnemt7EbLQBEOlo0faaJiUW9jzbRiJsmfiQWe0mpbAi1yaZ2TeAxrwZijJ_nGjhj5VnOC0RhlXG8HX2Bi8UeWD4GoEoOOPsbzBMNaK55rPUm7zRyKhMGrxD2001fBpIi3sFuZ1Gb4WJPQ',
      ) // Authorization header
      .expect(200)
      .expect((response) => {
        // Check that the response has the correct structure
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('language', 'french'); // Language is inside `data`
        expect(response.body.data).toHaveProperty('message'); // Ensure message exists
      });
  });

  it('should return a friendly message if the language does not exist (GET)', async () => {
    const messageLang = 'tahiti';

    return request(app.getHttpServer())
      .get(`/auth/${messageLang}`)
      .query({ site: 'MERIGNAC', root: 'OU=OU-EMI,OU=OU-FONCTIONNEL' })
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzYXZiR092QkRUV0ljSXQ4LXNGM2tOWmpoUjdxdk5ycmZFUUtoNldWUm1jIn0.eyJleHAiOjE3MzY0MjY1NzUsImlhdCI6MTczNjQyNjI3NSwianRpIjoiNzBiMWRiZDAtNWY3ZC00YWZjLTg5ZWEtZTI5NTNjM2EwYzBkIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjEuMzc6ODA4MC9yZWFsbXMvbmVzdC1yZWFsbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjYzQwOTNjMC1kMGEyLTQ1OGMtYTNjOC1iZmM5YjA1ZmJhMjciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJncmVldGluZy1hcHAiLCJzZXNzaW9uX3N0YXRlIjoiNDI0ZTQxYTUtM2I4My00MDQyLWFkNTgtYTUzNzY2N2U2NmJmIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtbmVzdC1yZWFsbSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiZ3JlZXRpbmctYXBwIjp7InJvbGVzIjpbIm1hbmFnZXJfcm9sZSJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiNDI0ZTQxYTUtM2I4My00MDQyLWFkNTgtYTUzNzY2N2U2NmJmIiwic2l0ZSI6Ik1FUklHTkFDIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvb3QiOiJDTj1Nb2hhbmFkIEJJS0FJLE9VPU9VLVVUSUxJU0FURVVSUyxPVT1PVS1FTUksT1U9T1UtRk9OQ1RJT05ORUwsT1U9T1UtTUVSSUdOQUMsREM9Z2VzdGZvcm0sREM9Zm9uY3Rpb25uZWwiLCJuYW1lIjoiYmFzaWMgdXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImdyZWV0aW5nLW1hbmFnZXIiLCJpZCI6ImRkYzk1OWZkLWIxOGEtNGQ0NS05NTZhLWFlZTY2ZGQ4YmVlMSIsImdpdmVuX25hbWUiOiJiYXNpYyIsImZhbWlseV9uYW1lIjoidXNlciIsImVtYWlsIjoidGVzdHVzZXJAZXhhbXBsZS5jb20ifQ.OgQIKb4kA2Z9LIfklLVDf8j5rshyVwr8_xUNF7t94VohFdjpITH6K4lJye4blhsMwGdepIvzwwbXdeXEn_McBypAnEkxMPqOlfd9fYLPRw-z6tcSXTEJ0cub1tY2-KmFHMxTjZ7z6LQeSMSrxYTq81kC-MLn3eDTVlvy0j8Zt06gALpQassryFP4BW4kHrhtrfugye_NiZnemt7EbLQBEOlo0faaJiUW9jzbRiJsmfiQWe0mpbAi1yaZ2TeAxrwZijJ_nGjhj5VnOC0RhlXG8HX2Bi8UeWD4GoEoOOPsbzBMNaK55rPUm7zRyKhMGrxD2001fBpIi3sFuZ1Gb4WJPQ',
      ) // Authorization header
      .expect(200)
      .expect((response) => {
        // Ensure the structure matches the expected output
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual(
          "Message for language 'tahiti' found successfully",
        );
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toEqual({
          message: `No messages found for language: ${messageLang}`,
        });
      });
  });
});
