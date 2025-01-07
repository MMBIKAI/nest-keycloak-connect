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

    // Extract and decode the token
    const token = this.tokenService.extractTokenFromHeader(authHeader);
    if (!token) {
      console.log('No token found.');
      return false;
    }

    let decodedToken;
    try {
      decodedToken = this.tokenService.decodeToken(token);
    } catch (error) {
      console.log('Error decoding token:', error.message);
      return false; // Return false if there's an error decoding the token (malformed)
    }

    if (!decodedToken) {
      console.log('Invalid token.');
      return false;
    }

    // Retrieve query parameters
    const querySite = request.query.site;
    const queryDn = request.query.root; // Make sure 'root' is the query parameter name

    console.log('Query Parameters:', { querySite, queryDn });

    // If 'site' query parameter is missing, return false
    if (!querySite) {
      console.log('Missing query parameter: site.');
      return false;
    }

    if (!queryDn) {
      console.log('Missing query parameter: root.');
      return false;
    }
    // Extract attributes from the token
    const tokenSite = decodedToken?.site;
    const tokenDn = decodedToken?.root;

    console.log('Decoded Token Site:', tokenSite);
    console.log('Query Site:', querySite);

    // Validate the 'site' attribute
    const isSiteValid = this.validateAttribute(tokenSite, querySite, 'site');
    if (!isSiteValid) {
      console.log('Site validation failed.');
      return false;
    }

    console.log('Decoded Token DN:', tokenDn);
    console.log('Query DN:', queryDn);

    // Check if the 'root' (LDAP DN) contains the required 'OU=OU-EMI' and 'OU=OU-FONCTIONNEL'
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
