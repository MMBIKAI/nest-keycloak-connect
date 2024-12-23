import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Define the Greeting entity
@Entity() // Marks this class as a database entity
export class Greeting {
  @PrimaryGeneratedColumn() // Auto-incrementing primary key
  id: number;

  @Column() // 'message' column in the database
  message: string;

  @Column() // 'language' column in the database
  language: string;
}
