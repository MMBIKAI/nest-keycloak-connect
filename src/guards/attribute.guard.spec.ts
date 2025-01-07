import { AttributeGuard } from './attribute.guard';
import { TokenService } from './token.treat';
import { ExecutionContext } from '@nestjs/common';

describe('AttributeGuard', () => {
  let guard: AttributeGuard;
  let mockTokenService: Partial<TokenService>;

  beforeEach(() => {
    // Mock the TokenService
    mockTokenService = {
      extractTokenFromHeader: jest.fn(),
      decodeToken: jest.fn(),
    };

    // Create the guard instance
    guard = new AttributeGuard(mockTokenService as TokenService);
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
    } as unknown as ExecutionContext;

    // Mock the TokenService behavior
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      null,
    );

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(false); // Guard should deny access
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
  });

  it('should return true if site and root match', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer mock-token' },
          query: { site: 'Merignac', root: 'OU=OU-EMI,OU=OU-FONCTIONNEL' }, // Query parameters
        }),
      }),
    } as unknown as ExecutionContext;

    // Mock the TokenService behavior
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      'mock-token',
    );
    (mockTokenService.decodeToken as jest.Mock).mockReturnValue({
      site: 'Merignac',
      root: 'OU=OU-EMI,OU=OU-FONCTIONNEL,DC=gestform,DC=fonctionnel',
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true); // Guard should allow access
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
    expect(mockTokenService.decodeToken).toHaveBeenCalledWith('mock-token');
  });

  it('should return false if site and root do not match', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer mock-token' },
          query: { site: 'TOULOUSE', root: 'OU=OU-TEST,OU=OU-FONCTIONNEL' }, // Mismatched Query parameters
        }),
      }),
    } as unknown as ExecutionContext;

    // Mock the TokenService behavior
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      'mock-token',
    );
    (mockTokenService.decodeToken as jest.Mock).mockReturnValue({
      site: 'Merignac',
      root: 'OU=OU-EMI,OU=OU-FONCTIONNEL,DC=gestform,DC=fonctionnel',
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(false); // Guard should deny access
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
    expect(mockTokenService.decodeToken).toHaveBeenCalledWith('mock-token');
  });

  it('should return false if site does not match', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer mock-token' },
          query: { site: 'BORDEAUX', root: 'OU=OU-EMI,OU=OU-FONCTIONNEL' }, // Mismatched site
        }),
      }),
    } as unknown as ExecutionContext;

    // Mock the TokenService behavior
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      'mock-token',
    );
    (mockTokenService.decodeToken as jest.Mock).mockReturnValue({
      site: 'Merignac', // Site is different
      root: 'OU=OU-EMI,OU=OU-FONCTIONNEL,DC=gestform,DC=fonctionnel', // Root matches
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(false); // Guard should deny access due to site mismatch
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
    expect(mockTokenService.decodeToken).toHaveBeenCalledWith('mock-token');
  });

  it('should return false if root does not match', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer mock-token' },
          query: { site: 'Merignac', root: 'OU=OU-TEST,OU=OU-FONCTIONNEL' }, // Mismatched root
        }),
      }),
    } as unknown as ExecutionContext;

    // Mock the TokenService behavior
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      'mock-token',
    );
    (mockTokenService.decodeToken as jest.Mock).mockReturnValue({
      site: 'Merignac', // Site matches
      root: 'OU=OU-EMI,OU=OU-FONCTIONNEL,DC=gestform,DC=fonctionnel', // Root is different
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(false); // Guard should deny access due to root mismatch
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
    expect(mockTokenService.decodeToken).toHaveBeenCalledWith('mock-token');
  });

  it('should return false if token is malformed', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer malformed-token' }, // Malformed token
          query: { site: 'Merignac', root: 'OU=OU-EMI,OU=OU-FONCTIONNEL' }, // Query parameters
        }),
      }),
    } as unknown as ExecutionContext;

    // Mock TokenService to throw an error when attempting to decode a malformed token
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      'malformed-token',
    );
    (mockTokenService.decodeToken as jest.Mock).mockImplementation(() => {
      throw new Error('Malformed token');
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(false); // Guard should deny access due to malformed token
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
    expect(mockTokenService.decodeToken).toHaveBeenCalledWith(
      'malformed-token',
    );
  });

  it('should return false if query parameters are missing', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer mock-token' },
          query: {}, // Missing query parameters
        }),
      }),
    } as unknown as ExecutionContext;

    // Mock TokenService behavior
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      'mock-token',
    );
    (mockTokenService.decodeToken as jest.Mock).mockReturnValue({
      site: 'Merignac',
      root: 'OU=OU-EMI,OU=OU-FONCTIONNEL,DC=gestform,DC=fonctionnel',
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(false); // Guard should deny access due to missing query parameters
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
    expect(mockTokenService.decodeToken).toHaveBeenCalledWith('mock-token');
  });

  it('should return false if site query parameter is missing', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer mock-token' },
          query: { root: 'OU=OU-EMI,OU=OU-FONCTIONNEL' }, // Missing site query parameter
        }),
      }),
    } as unknown as ExecutionContext;

    // Mock TokenService behavior
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      'mock-token',
    );
    (mockTokenService.decodeToken as jest.Mock).mockReturnValue({
      site: 'Merignac',
      root: 'OU=OU-EMI,OU=OU-FONCTIONNEL,DC=gestform,DC=fonctionnel',
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(false); // Guard should deny access due to missing 'site' query parameter
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
    expect(mockTokenService.decodeToken).toHaveBeenCalledWith('mock-token');
  });

  it('should return false if root query parameter is missing', async () => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer mock-token' },
          query: { site: 'Merignac' }, // Only site is present
        }),
      }),
    } as unknown as ExecutionContext;

    // Mock the TokenService behavior
    (mockTokenService.extractTokenFromHeader as jest.Mock).mockReturnValue(
      'mock-token',
    );
    (mockTokenService.decodeToken as jest.Mock).mockReturnValue({
      site: 'Merignac',
      root: 'OU=OU-EMI,OU=OU-FONCTIONNEL',
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(false); // Should return false because root is missing
    expect(mockTokenService.extractTokenFromHeader).toHaveBeenCalled();
    expect(mockTokenService.decodeToken).toHaveBeenCalledWith('mock-token');
  });
});
