import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'; // Import necessary decorators and types from NestJS
import axios from 'axios'; // Import axios for making HTTP requests to Keycloak

// Define the PermissionGuard class which implements CanActivate to control access to routes
@Injectable()
export class PermissionGuard implements CanActivate {
  // This method checks if the user has the necessary permission (scope) for a specific resource
  private async checkPermission(
    accessToken: string, // The access token from the request header
    resourceId: string, // The ID of the resource being accessed (e.g., "messages-resource")
    scope: string, // The scope (permission) required for the resource (e.g., "viewer")
  ): Promise<boolean> {
    try {
      console.log('Checking permissions...'); // Log before making the request

      // Make a POST request to Keycloak's Authorization Service to check permissions
      const response = await axios.post(
        'http://192.168.21.37:8080/realms/nest-realm/protocol/openid-connect/token',
        new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket', // The UMA ticket grant type to check permissions
          audience: 'greeting-app', // The audience (client) that the request is being made for
          permission: `${resourceId}#${scope}`, // The resource and scope being requested
          response_mode: 'permissions', // Request the response in the form of permissions
        }),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Authorization header containing the bearer token
            'Content-Type': 'application/x-www-form-urlencoded', // Set the content type to URL-encoded
          },
        },
      );

      console.log('Keycloak response:', response.data); // Log the response data from Keycloak

      // Extract the permissions from the response data
      const permissions = response.data;

      // Check if the permissions include the required resource and scope
      const hasPermission = permissions.some(
        (permission) =>
          permission.rsname === resourceId && permission.scopes.includes(scope),
      );

      // Log whether the user has the required permission
      console.log(
        `Permission check result: ${hasPermission ? 'Granted' : 'Denied'}`,
      );

      // Return true if the user has the necessary permission, otherwise return false
      return hasPermission;
    } catch (error) {
      console.error('Error checking permissions with Keycloak:', error); // Log any errors for debugging
      return false; // Return false if there was an error checking the permissions
    }
  }

  // The canActivate method is used by NestJS to determine whether the request should proceed
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest(); // Get the current HTTP request object

    // Extract the access token from the authorization header (if present)
    const accessToken = request.headers['authorization']?.split(' ')[1];

    console.log('Access token:', accessToken); // Log the extracted access token

    if (!accessToken) {
      // If no access token is provided in the request, throw a ForbiddenException
      console.error('No access token provided'); // Log the error
      throw new ForbiddenException('No access token provided');
    }

    const resourceId = 'messages-resource'; // Define the resource ID for messages (can be dynamic if needed)
    const scope = 'viewer'; // Define the required scope (e.g., "viewer" for viewing messages)

    console.log(
      `Checking permission for resource: ${resourceId}, scope: ${scope}`,
    ); // Log the resource and scope being checked

    // Call the checkPermission method to verify if the user has the required permission
    const hasPermission = await this.checkPermission(
      accessToken,
      resourceId,
      scope,
    );

    if (!hasPermission) {
      // If the user does not have the required permission, throw a ForbiddenException
      console.error('Insufficient permissions'); // Log the error
      throw new ForbiddenException('Insufficient permissions');
    }

    console.log('Permission granted'); // Log if permission is granted
    return true; // If the user has permission, return true to allow the request to proceed
  }
}
