/*import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken'; // Import the jsonwebtoken library

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Access the Authorization header to retrieve the Bearer token
    const authHeader = request.headers['authorization'];

    // Ensure the token exists and follows the Bearer format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authorization header missing or malformed');
      return false; // Return false if the token is missing or malformed
    }

    // Extract the token from the Authorization header
    const token = authHeader.substring(7); // Remove 'Bearer ' from the start of the string

    try {
      // Decode the JWT token to access the claims
      const decodedToken = jwt.decode(token);

      if (!decodedToken) {
        console.log('Failed to decode token');
        return false; // Return false if the token cannot be decoded
      }

      // Extract the user's roles from the decoded token
      const tokenRoles = this.getTokenRoles(decodedToken);

      console.log('Roles found:', tokenRoles);

      // Check if the user has the required role
      return this.hasUserRole(tokenRoles);
    } catch (error) {
      console.error('Error decoding token:', error);
      return false; // Return false in case of any error during decoding
    }
  }

  private getTokenRoles(decodedToken: any): string[] {
    // Extract roles from the decoded token's resource_access object
    return decodedToken?.resource_access?.['greeting-app']?.roles || [];
  }

  private hasUserRole(tokenRoles: string[]): boolean {
    // Check if the token contains the 'user_role'
    return tokenRoles.includes('user_role');
  }
}*/
// role.guard.ts
/*import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from './token.treat'; // Import the TokenService

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // Extract and decode the token
    const token = this.tokenService.extractTokenFromHeader(authHeader);
    if (!token) {
      return false;
    }

    const decodedToken = this.tokenService.decodeToken(token);
    if (!decodedToken) {
      return false;
    }

    // Check if the user has the required role
    const tokenRoles =
      decodedToken?.resource_access?.['greeting-app']?.roles || [];
    return tokenRoles.includes('user_role'); // Check if the required role exists
  }
}*/
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from './token.treat'; // Import the TokenService

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly requiredRoles: string[] = ['user_role', 'manager_role']; // Define the required roles

  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // Extract and decode the token
    const token = this.tokenService.extractTokenFromHeader(authHeader);
    if (!token) {
      return false;
    }

    const decodedToken = this.tokenService.decodeToken(token);
    if (!decodedToken) {
      return false;
    }

    // Extract the roles from the token
    const tokenRoles =
      decodedToken?.resource_access?.['greeting-app']?.roles || [];

    /*    // Check if the user has at least one of the required roles
    return this.hasRequiredRole(tokenRoles);
  }

  private hasRequiredRole(tokenRoles: string[]): boolean {
    return this.requiredRoles.some((role) => tokenRoles.includes(role));
  }
}*/
    // Extract roles from query parameters
    const queryRoles = this.extractRolesFromQuery(request.query);

    // Check if the user has at least one role from the query parameters
    return this.hasMatchingRole(tokenRoles, queryRoles);
  }

  private extractRolesFromQuery(query: any): string[] {
    // Extract 'role' from query parameters. It can be a single role or an array of roles.
    if (Array.isArray(query.role)) {
      return query.role; // Multiple roles provided as an array
    } else if (query.role) {
      return [query.role]; // Single role provided as a string
    }
    return []; // No roles specified in the query
  }

  private hasMatchingRole(tokenRoles: string[], queryRoles: string[]): boolean {
    // Check if there's an intersection between token roles and query roles
    return queryRoles.some((queryRole) => tokenRoles.includes(queryRole));
  }
}
