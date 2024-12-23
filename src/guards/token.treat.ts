// token.service.ts
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken'; // Import the jsonwebtoken library

@Injectable()
export class TokenService {
  // Extract the token from the Authorization header
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authorization header missing or malformed');
      return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // Decode the JWT token
  decodeToken(token: string): any {
    try {
      return jwt.decode(token); // Decode and return the payload
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
