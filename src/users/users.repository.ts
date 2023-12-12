import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';

import { CreateUserDto, UserOutput } from './users.dto';
import { generateRandomId } from 'src/utils';

@Injectable()
export class UserRepository {
  private readonly DB: DynamoDBDocumentClient;
  private readonly tableName = 'Users';

  constructor(private readonly configService: ConfigService) {
    const client = new DynamoDBClient({
      endpoint: this.configService.get('AWS_ENDPOINT'),
      region: this.configService.get('AWS_REGION'),
    });
    this.DB = DynamoDBDocumentClient.from(client);
  }

  async createUser(createUserDto: CreateUserDto) {
    const id = generateRandomId();
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        ...createUserDto,
        id,
      },
    });
    try {
      const result = await this.DB.send(command);

      return result;
    } catch (error) {
      throw new Error(`Could not create user: ${error.message}`);
    }
  }

  async findOneByEmail(email: string): Promise<UserOutput> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        email,
      },
    });

    try {
      const result = await this.DB.send(command);
      return result.Item as UserOutput;
    } catch (error) {
      throw new Error(`Could not retrieve users: ${error.message}`);
    }
  }
  async deleteUser(email: string) {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        email,
      },
    });

    try {
      const result = await this.DB.send(command);

      return result;
    } catch (error) {
      throw new Error(`Could not retrieve users: ${error.message}`);
    }
  }

  async updatePassword(email: string, newPassword: string) {
    const params = {
      TableName: this.tableName,
      Key: {
        email,
      },
      UpdateExpression: 'SET #key = :value',
      ExpressionAttributeNames: {
        '#key': 'password',
      },
      ExpressionAttributeValues: {
        ':value': newPassword,
      },
    };
    try {
      const command = new UpdateCommand(params);
      const result = await this.DB.send(command);

      return result;
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }
}
