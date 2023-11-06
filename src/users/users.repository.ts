import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';

import { CreateUserDto, UserDto } from './users.dto';

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
    const command = new PutCommand({
      TableName: this.tableName,
      Item: createUserDto,
    });
    try {
      const result = await this.DB.send(command);

      return result;
    } catch (error) {
      throw new Error(`Could not create user: ${error.message}`);
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

      return result.Item as UserDto;
    } catch (error) {
      throw new Error(`Could not retrieve users: ${error.message}`);
    }
  }
}
