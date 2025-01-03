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

    /*   // Check if the token has the correct site attribute
    const site = decodedToken?.site;
    return site === 'Merignac'; // Ensure the 'site' attribute matches 'Merignac'
  }
}*/
    // Retrieve query parameters
    const querySite = request.query.site;
    const queryDepartment = request.query.department;
    const queryTeam = request.query.team;

    // Check for 'site' and 'department' attributes in the token
    const tokenSite = decodedToken?.site;
    const tokenDepartment = decodedToken?.department;
    const tokenTeam = decodedToken?.team;

    // Validate both the 'site' and 'department' attributes
    const isSiteValid = this.validateAttribute(tokenSite, querySite, 'site');
    const isDepartmentValid = this.validateAttribute(
      tokenDepartment,
      queryDepartment,
      'department',
    );
    const isTeamValid = this.validateAttribute(tokenTeam, queryTeam, 'team');

    // Return true if both the site and department are valid, otherwise false
    return isSiteValid && isDepartmentValid && isTeamValid;
  }

  private validateAttribute(
    tokenAttribute: string,
    queryAttribute: string,
    attributeName: string,
  ): boolean {
    if (queryAttribute) {
      return tokenAttribute === queryAttribute;
    }
    // Optionally check if the attribute is required and reject if missing
    if (!tokenAttribute) {
      throw new Error(`${attributeName} attribute is missing in token.`);
    }
    return true;
  }
}
