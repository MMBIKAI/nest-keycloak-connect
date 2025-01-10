import { Test, TestingModule } from '@nestjs/testing';
//import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { Greeting } from '../src/auth/greeting.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth/auth.module';
import * as request from 'supertest';

describe('AuthController - Mock DB operations', () => {
  let app: INestApplication;
  //let authService: AuthService;

  // Mocked database (array of messages)
  const mockMessages = [
    { id: 3, message: 'Hello to the world', language: 'english' },
    { id: 4, message: 'Hola el mundo !!!!', language: 'spanish' },
    {
      id: 5,
      message: 'Salut !!!!!!!! tout le monde du merde',
      language: 'french',
    },
    { id: 9, message: 'Namaste, duniya!', language: 'indian' },
    { id: 10, message: 'Salut !! tout le monde du merde', language: 'french' },
    { id: 13, message: '3awefeh', language: 'lebanese slang' },
    { id: 14, message: '3awefeh', language: 'lebanese-slang' },
    { id: 15, message: 'Nihao', language: 'chinese' },
    { id: 16, message: '3awefeh', language: 'lebanese' },
    { id: 17, message: '3awefeh', language: 'lebanese' },
  ];

  beforeAll(async () => {
    const authServiceMock = {
      // Mocked 'create' function to add a message to the mock database
      create: jest.fn((message) => {
        const newMessage = {
          id: mockMessages.length + 1, // Simulating auto-increment ID
          ...message,
        };
        mockMessages.push(newMessage); // Add new message to mock array
        return Promise.resolve(newMessage);
      }),
      // Mocked 'find' function to return all messages
      findAll: jest.fn(() => Promise.resolve(mockMessages)),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './data/data.db', // In this case, it's not actually used
          entities: [Greeting],
          synchronize: true,
        }),
      ],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a new message (POST)', async () => {
    const newMessage = { language: 'german', message: 'Hallo Welt' };

    return request(app.getHttpServer())
      .post('/auth/create')
      .query({ site: 'MERIGNAC', root: 'OU=OU-EMI,OU=OU-FONCTIONNEL' })
      .set(
        'Authorization',
        'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzYXZiR092QkRUV0ljSXQ4LXNGM2tOWmpoUjdxdk5ycmZFUUtoNldWUm1jIn0.eyJleHAiOjE3MzY1MDIyMjMsImlhdCI6MTczNjUwMTkyMywianRpIjoiZDE2ODFjZWEtNmI3Yi00MWE1LWFjZDktZTI2M2M0YzU0MmU0IiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjEuMzc6ODA4MC9yZWFsbXMvbmVzdC1yZWFsbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjYzQwOTNjMC1kMGEyLTQ1OGMtYTNjOC1iZmM5YjA1ZmJhMjciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJncmVldGluZy1hcHAiLCJzZXNzaW9uX3N0YXRlIjoiYjI2NWIwMzctOTVlMy00Y2ExLTg0YmEtODM0YmNjODI2ZjEyIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtbmVzdC1yZWFsbSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiZ3JlZXRpbmctYXBwIjp7InJvbGVzIjpbIm1hbmFnZXJfcm9sZSJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiYjI2NWIwMzctOTVlMy00Y2ExLTg0YmEtODM0YmNjODI2ZjEyIiwic2l0ZSI6Ik1FUklHTkFDIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvb3QiOiJDTj1Nb2hhbmFkIEJJS0FJLE9VPU9VLVVUSUxJU0FURVVSUyxPVT1PVS1FTUksT1U9T1UtRk9OQ1RJT05ORUwsT1U9T1UtTUVSSUdOQUMsREM9Z2VzdGZvcm0sREM9Zm9uY3Rpb25uZWwiLCJuYW1lIjoiYmFzaWMgdXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImdyZWV0aW5nLW1hbmFnZXIiLCJpZCI6ImRkYzk1OWZkLWIxOGEtNGQ0NS05NTZhLWFlZTY2ZGQ4YmVlMSIsImdpdmVuX25hbWUiOiJiYXNpYyIsImZhbWlseV9uYW1lIjoidXNlciIsImVtYWlsIjoidGVzdHVzZXJAZXhhbXBsZS5jb20ifQ.AatsYJ8wmOUu__AgVKqBQA29DCXSeA8PmVW3aF6nytrkhzN_gg_isiXYOglqKpH72MMawng23j7WPYKR7OKns4xrzn8bYHPahSYwWlUvuSpt_Fmwiz7eVs6aPsLV_sH0FdMyEF5-Uac5B8TodkPsS1rLy-dEN5cHUA_Asy6nauK1IANVe2rW4VwSauPfxLoI0vKfjTp5mrLYFQrp3fMJ8vyfUIVpAN61humW-ayaDWcfR-j-9l95Q1jW7Slg075T6s5Hhff2urg_vA6J0gf9gDfS77TzCTIU3dbgf_pI3KOOA8I8TRUqaZ2vY5emVIP3Oyi8tPSUmF8r-P4QyioPVA',
      ) // Authorization header
      .send(newMessage)
      .expect(201)
      .expect((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('message', 'Hallo Welt');
        expect(response.body).toHaveProperty('language', 'german');
      });
  });
});
