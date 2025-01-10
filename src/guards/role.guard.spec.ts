import { RoleGuard } from './role.guard';
import { TokenService } from './token.treat';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let mockTokenService: Partial<TokenService>;
  //let mockExecutionContext: Partial<ExecutionContext>;
  let mockReflector: Partial<Reflector>; // Mock the Reflector

  beforeEach(() => {
    // Mock the TokenService
    mockTokenService = {
      extractTokenFromHeader: jest.fn(),
      decodeToken: jest.fn(),
    };

    // Mock the Reflector
    mockReflector = {
      get: jest.fn(),
    };

    // Create the guard instance with the mocked Reflector
    guard = new RoleGuard(
      mockTokenService as TokenService,
      mockReflector as Reflector,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false if no token is provided', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {}, // No authorization header
        }),
      }),
      getHandler: jest.fn().mockReturnValue(() => {}), // Mock getHandler to return a dummy function
    } as unknown as ExecutionContext;

    // Mock the TokenService behavior
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      null, // No token provided
    );

    const result = await guard.canActivate(mockContext);

    // Assert the guard denies access
    expect(result).toBe(false);

    // Verify that extractTokenFromHeader was called once
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
  });

  it('should return true if a valid token is provided and contains one of the required roles', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'mock-token' }, // Mock the authorization header with a token
        }),
      }),
      getHandler: jest.fn().mockReturnValue(() => {}), // Mock getHandler to return a dummy function
    } as unknown as ExecutionContext;

    // Mock the Reflector to return the required roles metadata
    (mockReflector.get as jest.Mock).mockReturnValue({
      roles: ['user_role', 'manager_role'], // Roles required for access
    });

    // Mock the TokenService to return a valid decoded token with roles
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      'mock-token',
    );
    (mockTokenService.decodeToken as jest.Mock).mockReturnValue({
      resource_access: {
        'greeting-app': {
          roles: ['user_role'], // Token contains the required role
        },
      },
    });

    const result = await guard.canActivate(mockContext);

    // Assert the guard allows access
    expect(result).toBe(true);

    // Verify the token extraction and decoding methods were called
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
    expect(mockTokenService.decodeToken).toHaveBeenCalled();
  });

  it('should return false if the token is invalid or does not contain the required roles', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'invalid-token' }, // Mock the authorization header with an invalid token
        }),
      }),
      getHandler: jest.fn().mockReturnValue(() => {}), // Mock getHandler to return a dummy function
    } as unknown as ExecutionContext;

    // Mock the Reflector to return the required roles metadata
    (mockReflector.get as jest.Mock).mockReturnValue({
      roles: ['user_role', 'manager_role'], // Roles required for access
    });

    // Mock the TokenService to simulate the invalid token scenario
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      'invalid-token',
    );
    (mockTokenService.decodeToken as jest.Mock).mockReturnValue(null); // Return null to simulate invalid token

    const result = await guard.canActivate(mockContext);

    // Assert that the guard denies access when the token is invalid or does not contain required roles
    expect(result).toBe(false);

    // Verify that the token extraction and decoding methods were called
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
    expect(mockTokenService.decodeToken).toHaveBeenCalled();
  });
});
