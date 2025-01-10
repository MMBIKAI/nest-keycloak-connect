// attribute.guard.ts
/*import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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
/*  const querySite = request.query.site;
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
}*/
// attribute.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from './token.treat';

@Injectable()
export class AttributeGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    const token = this.extractAndDecodeToken(authHeader);
    if (!token) {
      return false;
    }

    const { querySite, queryDn } = this.extractQueryParameters(request);
    if (!querySite || !queryDn) {
      return false;
    }

    const { tokenSite, tokenDn } = this.extractTokenAttributes(token);
    if (!this.validateSite(tokenSite, querySite)) {
      return false;
    }

    if (!this.validateRoot(tokenDn, queryDn)) {
      return false;
    }

    return true;
  }

  private extractAndDecodeToken(authHeader: string): any {
    const token = this.tokenService.extractTokenFromHeader(authHeader);
    if (!token) {
      console.log('No token found.');
      return null;
    }

    try {
      return this.tokenService.decodeToken(token);
    } catch (error) {
      console.log('Error decoding token:', error.message);
      return null;
    }
  }

  private extractQueryParameters(request: any): {
    querySite: string;
    queryDn: string;
  } {
    const querySite = request.query.site;
    const queryDn = request.query.root;
    console.log('Query Parameters:', { querySite, queryDn });

    if (!querySite) {
      console.log('Missing query parameter: site.');
    }

    if (!queryDn) {
      console.log('Missing query parameter: root.');
    }

    return { querySite, queryDn };
  }

  private extractTokenAttributes(decodedToken: any): {
    tokenSite: string;
    tokenDn: string;
  } {
    const tokenSite = decodedToken?.site;
    const tokenDn = decodedToken?.root;
    console.log('Decoded Token Site:', tokenSite);
    console.log('Decoded Token DN:', tokenDn);
    return { tokenSite, tokenDn };
  }

  private validateSite(tokenSite: string, querySite: string): boolean {
    const isSiteValid = this.validateAttribute(tokenSite, querySite, 'site');
    if (!isSiteValid) {
      console.log('Site validation failed.');
      return false;
    }
    return true;
  }

  private validateRoot(tokenDn: string, queryDn: string): boolean {
    const isRootValid = this.checkRoot(tokenDn, queryDn);
    if (!isRootValid) {
      console.log('Root validation failed.');
      return false;
    }
    return true;
  }

  private validateAttribute(
    tokenAttribute: string,
    queryAttribute: string,
    attributeName: string,
  ): boolean {
    if (queryAttribute) {
      if (tokenAttribute !== queryAttribute) {
        console.log(
          `Token ${attributeName} does not match query ${attributeName}.`,
        );
        return false;
      }
      return true;
    }

    // Optionally check if the attribute is required and reject if missing
    if (!tokenAttribute) {
      throw new Error(`${attributeName} attribute is missing in token.`);
    }
    return true;
  }

  private checkRoot(tokenDn: string, queryDn: string): boolean {
    if (!tokenDn || !queryDn) {
      console.log('Token DN or Query DN is missing.');
      return false;
    }

    // Split the token DN and query DN into parts
    const tokenDnParts = tokenDn.split(',');
    const queryDnParts = queryDn.split(',');

    console.log('Token DN Parts:', tokenDnParts);
    console.log('Query DN Parts:', queryDnParts);

    // Check if token DN contains the necessary parts of the query DN
    const containsRequiredOUs = queryDnParts.every((part) =>
      tokenDnParts.some((tokenPart) => tokenPart.includes(part)),
    );

    console.log('Required OUs present:', containsRequiredOUs);

    return containsRequiredOUs;
  }
}
