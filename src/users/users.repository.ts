// src/users/user.repository.ts

import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

import { CreateUserDto, UserDto } from './users.dto';

@Injectable()
export class UserRepository {
  private readonly DB: DynamoDBDocumentClient;
  private readonly tableName = 'users';

  constructor() {
    const client = new DynamoDBClient({});
    this.DB = DynamoDBDocumentClient.from(client);
  }

  async createUser(createUserDto: CreateUserDto) {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: createUserDto,
    });
    try {
      const result = await this.DB.send(command);
      console.log(result);
      return result;
    } catch (error) {
      throw new Error(`Could not create user: ${error.message}`);
    }
  }

  async findOneById(id: number): Promise<UserDto> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        id,
      },
    });

    try {
      const result = await this.DB.send(command);
      console.log(result);
      return result[0] as UserDto;
    } catch (error) {
      throw new Error(`Could not retrieve users: ${error.message}`);
    }
  }

  async findOneByEmail(email: string): Promise<UserDto> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        email,
      },
    });

    try {
      const result = await this.DB.send(command);

      return result[0] as UserDto;
    } catch (error) {
      throw new Error(`Could not retrieve users: ${error.message}`);
    }
  }
}
