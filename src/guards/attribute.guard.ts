// attribute.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from './token.treat'; // Import the TokenService

@Injectable()
export class AttributeGuard implements CanActivate {
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

    // Check if the token has the correct site attribute
    const site = decodedToken?.site;
    return site === 'Merignac'; // Ensure the 'site' attribute matches 'Merignac'
  }
}
