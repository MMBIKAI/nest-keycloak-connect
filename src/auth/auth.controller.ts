import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
//import { Public } from 'nest-keycloak-connect';
//import { greeting } from './greeting';
import { Greeting } from './greeting.entity';
import { Roles } from 'nest-keycloak-connect';
import { RoleGuard } from '../guards/role.guard';
import { AttributeGuard } from '../guards/attribute.guard';
//import { PermissionGuard } from 'src/guards/permission.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  //@Public(true) // Make sure this decorator is correct for your use case
  @HttpCode(HttpStatus.OK)
  @Get('messages')
  @Roles({ roles: ['user_role', 'manager_role'] })
  @UseGuards(RoleGuard, AttributeGuard) // Use RoleGuard to protect the route
  async findAll() {
    try {
      const messages = await this.authService.findAllMessages();

      // If no messages are found, return a friendly message
      if (!messages || messages.length === 0) {
        return {
          message: 'No messages found',
        };
      }

      // Return the list of messages if found
      return {
        message: 'Messages retrieved successfully',
        data: messages, // Return the messages in the response
      };
    } catch (error) {
      console.error('Error fetching messages:', error); // Log the error for debugging
      throw new HttpException(
        'Failed to retrieve messages',
        HttpStatus.INTERNAL_SERVER_ERROR, // Return a 500 Internal Server Error
      );
    }
  }

  @Get(':language')
  @Roles({ roles: ['user_role', 'manager_role'] })
  @UseGuards(RoleGuard, AttributeGuard) // Use RoleGuard to protect the route
  async findByLang(@Param('language') language: string) {
    console.log(`Received language: ${language}`); // Debug log

    try {
      const result = await this.authService.findByLang(language);

      // If no message is found for the language, return a friendly message
      if (Array.isArray(result) && result.length === 0) {
        return {
          message: `No messages found for language: ${language}`,
        };
      }

      // Return the found message
      return {
        message: `Message for language '${language}' found successfully`,
        data: result, // Include the found result in the response
      };
    } catch (error) {
      console.error('Error fetching message:', error); // Log the error for debugging
      throw new HttpException(
        `Failed to retrieve message for language: ${language}`,
        HttpStatus.INTERNAL_SERVER_ERROR, // Return 500 Internal Server Error
      );
    }
  }

  @Post('create')
  @Roles({ roles: ['manager_role'] })
  @UseGuards(RoleGuard, AttributeGuard)
  async create(@Body() body: Greeting) {
    try {
      // Check if the body contains the required fields
      if (!body || !body.message || !body.language) {
        throw new HttpException(
          'Missing required fields: message or language',
          HttpStatus.BAD_REQUEST, // Return 400 Bad Request if required fields are missing
        );
      }
      console.log('POST /auth called with:', body); // Debug log
      // Calling the service method to create a new greeting message
      const result = await this.authService.create(body);

      // Return success response with the created greeting message
      return {
        message: 'Greeting message created successfully',
        data: result, // Optionally return the created message in the response
      };
    } catch (error) {
      console.error('Error creating message:', error); // Log the error for debugging purposes

      // Check if the error is an instance of HttpException and rethrow it
      if (error instanceof HttpException) {
        throw error;
      }
      // Return a generic internal server error for other cases
      throw new HttpException(
        'Failed to create greeting message',
        HttpStatus.INTERNAL_SERVER_ERROR, // Return a 500 Internal Server Error
      );
    }
  }

  @Delete('delete/:language')
  @Roles({ roles: ['manager_role'] })
  @UseGuards(RoleGuard, AttributeGuard)
  async deleteByLang(@Param('language') language: string) {
    try {
      const result = await this.authService.deleteByLang(language);

      if (result) {
        // Return a success response when deletion is successful
        return {
          message: `Messages with language '${language}' deleted successfully`,
        };
      } else {
        // If no messages were found to delete, return a message
        return {
          message: `No messages found for language '${language}' to delete`,
        };
      }
    } catch (error) {
      console.log('Error deleting messages:', error); // Log the error for debugging

      // Return a custom error message
      throw new HttpException(
        `Failed to delete messages for language: ${language}`,
        HttpStatus.INTERNAL_SERVER_ERROR, // Return a 500 Internal Server Error
      );
    }
  }

  @Put('edit/:language')
  @Roles({ roles: ['manager_role'] })
  @UseGuards(RoleGuard, AttributeGuard)
  async update(@Param('language') language: string, @Body() body: Greeting) {
    try {
      const updatedGreeting = await this.authService.update(language, body);

      if (updatedGreeting) {
        // Return a success response when the update is successful
        return {
          message: `Message for language '${language}' updated successfully`,
          data: updatedGreeting, // Return the updated greeting message
        };
      } else {
        // If the language does not exist, return a message saying so
        return {
          message: `No message found for language '${language}' to update`,
        };
      }
    } catch (error) {
      console.error('Error updating message:', error); // Log the error for debugging purposes

      // Return a custom error message
      throw new HttpException(
        `Failed to update message for language: ${language}`,
        HttpStatus.INTERNAL_SERVER_ERROR, // Return a 500 Internal Server Error
      );
    }
  }
}
