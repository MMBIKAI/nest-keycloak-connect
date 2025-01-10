import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakConfigService } from './keycloak-config.service';
import { PolicyEnforcementMode, TokenValidation } from 'nest-keycloak-connect';

describe('KeycloakConfigService', () => {
  let service: KeycloakConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeycloakConfigService],
    }).compile();

    service = module.get<KeycloakConfigService>(KeycloakConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return correct Keycloak configuration options', () => {
    const options = service.createKeycloakConnectOptions();

    expect(options).toEqual({
      authServerUrl: 'http://192.168.21.37:8080/realms/nest-realm',
      realm: 'nest-realm',
      clientId: 'greeting-app',
      secret: 'SdsCTngWCcSQODFN2nP2fEVLrIO7Ic4i',
      //cookieKey: 'KEYCLOAK_JWT',
      logLevels: ['verbose'],
      useNestLogger: false,
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    });
  });

  it('should fail if configuration does not match expected values', () => {
    const options = service.createKeycloakConnectOptions();

    // Intentionally check incorrect values for validation
    expect(options).not.toEqual({
      authServerUrl: 'http://192.168.21.37:8180/realms/nest-realm',
      realm: 'nest-realm',
      clientId: 'greeitng-app',
      secret: 'SdsCTngWCcSQODFN2nP2fEVLrIO7Ic4i',
      logLevels: ['verbose'],
      useNestLogger: false,
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    });
  });
});
