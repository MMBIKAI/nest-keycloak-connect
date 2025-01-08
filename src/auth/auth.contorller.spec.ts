import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RoleGuard } from '../guards/role.guard';
import { AttributeGuard } from '../guards/attribute.guard';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Greeting } from './greeting.entity';
//import { greeting } from './greeting';
//import { Greeting } from './greeting.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  // Mock data for a greeting message
  const mockGreeting: any = {
    message: 'Hello to the fucking world',
    language: 'english',
  };

  // Mocking the AuthService
  const mockAuthService = {
    findAllMessages: jest.fn(),
    findByLang: jest.fn(),
    create: jest.fn().mockResolvedValue(mockGreeting), // Mocking successful service
    deleteByLang: jest.fn(),
    update: jest.fn(),
  };

  const mockMessages = [
    { id: 3, message: 'Hello to the world', language: 'english' },
    { id: 4, message: 'Hola el mundo !!!!', language: 'spanish' },
    {
      id: 5,
      message: 'Salut !!!!!!!! tout le monde du merde',
      language: 'french',
    },
    { id: 9, message: 'Namaste, duniya!', language: 'indian' },
    { id: 10, message: 'Salut !! tout le monde du merde', language: 'french' },
    { id: 13, message: '3awefeh', language: 'lebanese slang' },
    { id: 14, message: '3awefeh', language: 'lebanese-slang' },
    { id: 15, message: 'Nihao', language: 'chinese' },
    { id: 16, message: '3awefeh', language: 'lebanese' },
    { id: 17, message: '3awefeh', language: 'lebanese' },
  ];

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(RoleGuard) // Mocking guards
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AttributeGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
  });

  describe('findAll', () => {
    it('should return success message and data from the database', async () => {
      // Mocking the service method to return the data
      mockAuthService.findAllMessages.mockResolvedValue(mockMessages);

      const result = await authController.findAll();
      expect(result).toEqual({
        message: 'Messages retrieved successfully',
        data: mockMessages,
      });
    });

    it('should return "No messages found" if no messages are found', async () => {
      // Mocking the service method to return an empty array
      mockAuthService.findAllMessages.mockResolvedValue([]);

      const result = await authController.findAll();
      expect(result).toEqual({
        message: 'No messages found',
      });
    });

    it('should throw an HttpException if there is an error', async () => {
      try {
        await authController.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe('Failed to retrieve messages');
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('findByLang', () => {
    it('should return message for the given language', async () => {
      const language = 'english';
      const resultMessages = mockMessages.filter(
        (el) => el.language === language,
      );
      // Mock the service to return filtered messages
      mockAuthService.findByLang.mockResolvedValue(resultMessages);

      const result = await authController.findByLang(language);

      expect(result.message).toBe(
        `Message for language '${language}' found successfully`,
      );
      expect(result.data).toEqual(resultMessages);
    });

    it('should return no messages found if language does not exist', async () => {
      const language = 'haiti';

      // Mock the service to return no data
      mockAuthService.findByLang.mockResolvedValue([]);

      const result = await authController.findByLang(language);

      expect(result.message).toBe(
        `No messages found for language: ${language}`,
      );
      expect(result.data).toBeUndefined();
    });

    it('should throw an error if there is a problem fetching the message', async () => {
      const language = 'french';

      try {
        await authController.findByLang(language);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe(
          `Failed to retrieve message for language: ${language}`,
        );
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('create', () => {
    it('should create a new greeting message', async () => {
      const result = await authController.create(mockGreeting);
      expect(result.message).toBe('Greeting message created successfully');
      expect(result.data).toEqual(mockGreeting);
    });

    it('should throw an error if creation fails', async () => {
      try {
        await authController.create(mockGreeting);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe('Failed to create greeting message');
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deleteByLang', () => {
    it('should delete messages successfully for a valid language', async () => {
      const language = 'french';

      // Mocking the deleteByLang method to simulate successful deletion
      mockAuthService.deleteByLang.mockResolvedValue(
        mockMessages.filter((msg) => msg.language === language).length > 0,
      );

      const result = await authController.deleteByLang(language);

      // Expect that deleteByLang was called with the correct language
      expect(authService.deleteByLang).toHaveBeenCalledWith(language);

      // Expect a success message when messages are deleted
      expect(result).toEqual({
        message: `Messages with language '${language}' deleted successfully`,
      });
    });

    it('should return a message when no messages are found for the given language', async () => {
      const language = 'german';

      // Mocking the deleteByLang method to simulate no messages found
      mockAuthService.deleteByLang.mockResolvedValue(false);

      const result = await authController.deleteByLang(language);

      // Expect a message stating no messages were found for the language
      expect(result).toEqual({
        message: `No messages found for language '${language}' to delete`,
      });
    });

    it('should throw an error if deletion fails', async () => {
      const language = 'french';

      // Simulate an error during deletion
      mockAuthService.deleteByLang.mockRejectedValue(
        new Error('Deletion failed'),
      );

      try {
        await authController.deleteByLang(language);
      } catch (error) {
        // Expect an HttpException if deletion fails
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe(
          `Failed to delete messages for language: ${language}`,
        );
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('Update', () => {
    it('should update the greeting message for the given language', async () => {
      const language = 'spanish';
      const updateBody = { message: 'Hola el mundo !!!!', language: 'spanish' }; // New message
      const updatedGreeting = mockMessages.map(
        (greeting) =>
          greeting.language === language
            ? { ...greeting, ...updateBody } // Only update the matching language
            : greeting, // Leave other greetings unchanged
      );

      // Mock the update service method to return the updated greeting
      mockAuthService.update.mockResolvedValue(updatedGreeting);

      const result = await authController.update(
        language,
        updateBody as Greeting,
      );

      expect(result.message).toBe(
        `Message for language '${language}' updated successfully`,
      );
      expect(result.data).toEqual(updatedGreeting);
    });

    it('should return "No message found for language" if no message is found to update', async () => {
      const language = 'haiti';
      const updateBody = { message: 'Hola el mundo !!!!', language: 'haiti' };

      // Mock the update service method to return null (indicating no message was found)
      mockAuthService.update.mockResolvedValue(null);

      const result = await authController.update(
        language,
        updateBody as Greeting,
      );

      expect(result.message).toBe(
        `No message found for language '${language}' to update`,
      );
    });

    it('should throw an HttpException if there is an error during update', async () => {
      const language = 'spanish';
      const updateBody = { language: 'spanish' };

      // Simulate an error during update
      mockAuthService.update.mockRejectedValue(new Error('Update failed'));

      try {
        await authController.update(language, updateBody as Greeting);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe(
          `Failed to update message for language: ${language}`,
        );
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
