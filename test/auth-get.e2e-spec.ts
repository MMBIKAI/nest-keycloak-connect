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
        'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzYXZiR092QkRUV0ljSXQ4LXNGM2tOWmpoUjdxdk5ycmZFUUtoNldWUm1jIn0.eyJleHAiOjE3MzY0MTk0NjUsImlhdCI6MTczNjQxOTE2NSwianRpIjoiNWRiMGY3ZWEtYTYzNi00MDkzLTkwYmUtNDM5YjZjOWJlOTc3IiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjEuMzc6ODA4MC9yZWFsbXMvbmVzdC1yZWFsbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjYzQwOTNjMC1kMGEyLTQ1OGMtYTNjOC1iZmM5YjA1ZmJhMjciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJncmVldGluZy1hcHAiLCJzZXNzaW9uX3N0YXRlIjoiNDNjOGM4OGUtNWM3My00OWYyLTliOGYtZGU5ODBlM2FlMWNmIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtbmVzdC1yZWFsbSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiZ3JlZXRpbmctYXBwIjp7InJvbGVzIjpbIm1hbmFnZXJfcm9sZSJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiNDNjOGM4OGUtNWM3My00OWYyLTliOGYtZGU5ODBlM2FlMWNmIiwic2l0ZSI6Ik1FUklHTkFDIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvb3QiOiJDTj1Nb2hhbmFkIEJJS0FJLE9VPU9VLVVUSUxJU0FURVVSUyxPVT1PVS1FTUksT1U9T1UtRk9OQ1RJT05ORUwsT1U9T1UtTUVSSUdOQUMsREM9Z2VzdGZvcm0sREM9Zm9uY3Rpb25uZWwiLCJuYW1lIjoiYmFzaWMgdXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImdyZWV0aW5nLW1hbmFnZXIiLCJpZCI6ImRkYzk1OWZkLWIxOGEtNGQ0NS05NTZhLWFlZTY2ZGQ4YmVlMSIsImdpdmVuX25hbWUiOiJiYXNpYyIsImZhbWlseV9uYW1lIjoidXNlciIsImVtYWlsIjoidGVzdHVzZXJAZXhhbXBsZS5jb20ifQ.jgD5y_SfH5lmRHb_VgQxIRNdJ5Q1l0L9J-7GNLi-6F1-lXDHafY6tA7g1KLmGaZp-M9zk1kTSvEoTDEfRbMjynAniY_cV2D1vWZlIfrqBtVLFkC2xm5G7huVXjYosy6pPdggcr8vdgT0oRfDq3ocF1hgHmXHLBaRhXzt8WmHIKN8thQm-JrMPHegcpi2C2dBrpoGj_ocD4s9Udi0u74gkNXd0iz_3SXfVChs4R-ob4KZuT-TTccI9ZAMflvnP_pjXthDgzO0SMYj3eVdnxYf7IwcrffpQA1WaJ05L-wuFxPzHTwrjuTiw3tAUFZyvDXr7kPb-6o0KN8YOjpSehr0LQ',
      ) // Authorization header
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBeGreaterThan(0); // Check for non-empty response
      });
  });

  it('should return 403 Forbidden for expired token (GET)', async () => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIjogInRlc3QifQ.eyJleHAiOjE2Nzg0MTgwMTcsInVybCI6Inh0cCIsInN1YiI6IkFwaSIsImNsaWVudF9pZCI6ImFwaS1jdXN0b21lciJ9'; // Sample expired token

    return request(app.getHttpServer())
      .get('/auth/messages') // Assuming '/auth/messages' is the endpoint for fetching messages
      .query({ site: 'MERIGNAC', root: 'OU=OU-EMI,OU=OU-FONCTIONNEL' }) // Add query params
      .set('Authorization', `Bearer ${expiredToken}`) // Using the expired token
      .expect(403) // Expect a Forbidden response
      .expect((response) => {
        expect(response.body.message).toBe('Forbidden resource'); // Ensure the message matches
      });
  });

  it('should return 403 Forbidden without site query (GET)', async () => {
    const expiredToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJzYXZiR092QkRUV0ljSXQ4LXNGM2tOWmpoUjdxdk5ycmZFUUtoNldWUm1jIn0.eyJleHAiOjE3MzY0MTk0NjUsImlhdCI6MTczNjQxOTE2NSwianRpIjoiNWRiMGY3ZWEtYTYzNi00MDkzLTkwYmUtNDM5YjZjOWJlOTc3IiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjEuMzc6ODA4MC9yZWFsbXMvbmVzdC1yZWFsbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjYzQwOTNjMC1kMGEyLTQ1OGMtYTNjOC1iZmM5YjA1ZmJhMjciLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJncmVldGluZy1hcHAiLCJzZXNzaW9uX3N0YXRlIjoiNDNjOGM4OGUtNWM3My00OWYyLTliOGYtZGU5ODBlM2FlMWNmIiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtbmVzdC1yZWFsbSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiZ3JlZXRpbmctYXBwIjp7InJvbGVzIjpbIm1hbmFnZXJfcm9sZSJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwic2lkIjoiNDNjOGM4OGUtNWM3My00OWYyLTliOGYtZGU5ODBlM2FlMWNmIiwic2l0ZSI6Ik1FUklHTkFDIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvb3QiOiJDTj1Nb2hhbmFkIEJJS0FJLE9VPU9VLVVUSUxJU0FURVVSUyxPVT1PVS1FTUksT1U9T1UtRk9OQ1RJT05ORUwsT1U9T1UtTUVSSUdOQUMsREM9Z2VzdGZvcm0sREM9Zm9uY3Rpb25uZWwiLCJuYW1lIjoiYmFzaWMgdXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImdyZWV0aW5nLW1hbmFnZXIiLCJpZCI6ImRkYzk1OWZkLWIxOGEtNGQ0NS05NTZhLWFlZTY2ZGQ4YmVlMSIsImdpdmVuX25hbWUiOiJiYXNpYyIsImZhbWlseV9uYW1lIjoidXNlciIsImVtYWlsIjoidGVzdHVzZXJAZXhhbXBsZS5jb20ifQ.jgD5y_SfH5lmRHb_VgQxIRNdJ5Q1l0L9J-7GNLi-6F1-lXDHafY6tA7g1KLmGaZp-M9zk1kTSvEoTDEfRbMjynAniY_cV2D1vWZlIfrqBtVLFkC2xm5G7huVXjYosy6pPdggcr8vdgT0oRfDq3ocF1hgHmXHLBaRhXzt8WmHIKN8thQm-JrMPHegcpi2C2dBrpoGj_ocD4s9Udi0u74gkNXd0iz_3SXfVChs4R-ob4KZuT-TTccI9ZAMflvnP_pjXthDgzO0SMYj3eVdnxYf7IwcrffpQA1WaJ05L-wuFxPzHTwrjuTiw3tAUFZyvDXr7kPb-6o0KN8YOjpSehr0LQ'; // Sample expired token

    return request(app.getHttpServer())
      .get('/auth/messages') // Endpoint for fetching messages
      .query({ root: 'OU=OU-EMI,OU=OU-FONCTIONNEL' })
      .set('Authorization', `Bearer ${expiredToken}`) // Using the expired token
      .expect(403) // Expect a Forbidden response
      .expect((response) => {
        expect(response.body.message).toBe('Forbidden resource'); // Ensure the message matches the actual response
      });
  });

  it('should return 403 Forbidden for expired token without root query (GET)', async () => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIjogInRlc3QifQ.eyJleHAiOjE2Nzg0MTgwMTcsInVybCI6Inh0cCIsInN1YiI6IkFwaSIsImNsaWVudF9pZCI6ImFwaS1jdXN0b21lciJ9'; // Sample expired token

    return request(app.getHttpServer())
      .get('/auth/messages') // Endpoint for fetching messages
      .query({ site: 'MERIGNAC' })
      .set('Authorization', `Bearer ${expiredToken}`) // Using the expired token
      .expect(403) // Expect a Forbidden response
      .expect((response) => {
        expect(response.body.message).toBe('Forbidden resource'); // Ensure the message matches the actual response
      });
  });
});
