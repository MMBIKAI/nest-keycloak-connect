import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { greeting } from './greeting';
import { InjectRepository } from '@nestjs/typeorm';
import { Greeting } from './greeting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Greeting)
    private greetingRepository: Repository<Greeting>,
  ) {}
  /*messages: greeting[] = [
    {
      message: 'Hello to the World',
      language: 'english',
    },
    {
      message: 'Salut tout le monde',
      language: 'french',
    },
    {
      message: 'Marhaba ila el 3alam',
      language: 'arabic',
    },
  ];*/

  async findAllMessages() {
    try {
      const messages = await this.greetingRepository.find(); // Fetch all messages from the database
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error); // Log the error for debugging purposes
      throw new HttpException(
        'Failed to retrieve messages from the database',
        HttpStatus.INTERNAL_SERVER_ERROR, // Return a 500 Internal Server Error
      );
    }
  }

  async findByLang(language: string) {
    console.log(`Searching for: ${language}`); // Debug log

    try {
      // Fetch the message from the database based on language
      const result = await this.greetingRepository.findOne({
        where: { language },
      });

      // If no result is found, return a custom message
      if (!result) {
        return { message: `No messages found for language: ${language}` };
      }

      return result;
    } catch (error) {
      console.error('Error fetching message by language:', error); // Log the error for debugging purposes
      throw new HttpException(
        'Failed to retrieve message from the database',
        HttpStatus.INTERNAL_SERVER_ERROR, // Return a 500 Internal Server Error
      );
    }
  }

  async create(message: Greeting) {
    if (this.isInvalidGreeting(message)) {
      // If message or language is missing, throw a bad request error
      throw new HttpException(
        'Message and language are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create a new Greeting instance and save it to the database
    const newGreeting = this.greetingRepository.create(message);

    try {
      const savedGreeting = await this.greetingRepository.save(newGreeting);

      return {
        message: 'Greeting message created successfully',
        data: savedGreeting, // Returning the saved data
      };
    } catch (error) {
      // Handle any errors that occur during the saving process
      console.error('Error saving greeting:', error);
      throw new HttpException(
        'Error saving greeting to the database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private isInvalidGreeting(message: Greeting): boolean {
    return !message || !message.message || !message.language;
  }

  async deleteByLang(language: string) {
    try {
      // Delete messages from the database with the specified language
      const result = await this.greetingRepository.delete({ language });

      // Check if no records were deleted
      if (result.affected === 0) {
        return { message: `No messages found with language '${language}'` };
      }

      return {
        message: `Messages with language '${language}' deleted successfully`,
      };
    } catch (error) {
      console.error('Error deleting messages:', error); // Log the error for debugging purposes
      throw new HttpException(
        'Failed to delete messages from the database',
        HttpStatus.INTERNAL_SERVER_ERROR, // Return a 500 Internal Server Error
      );
    }
  }

  async update(oldLanguage: string, updatedGreeting: greeting) {
    try {
      // Find the message by language in the database
      const message = await this.greetingRepository.findOne({
        where: { language: oldLanguage },
      });

      // Check if the message was not found
      if (!message) {
        throw new Error(`Message with language '${oldLanguage}' not found`);
      }

      // Update the message with the new values
      message.message = updatedGreeting.message;
      message.language = updatedGreeting.language;

      // Save the updated message to the database
      await this.greetingRepository.save(message);

      return {
        message: `Message for language '${oldLanguage}' updated successfully`,
        updatedGreeting: message,
      };
    } catch (error) {
      console.error('Error updating message:', error); // Log the error for debugging purposes
      throw new HttpException(
        `Failed to update message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR, // Return a 500 Internal Server Error
      );
    }
  }
}
