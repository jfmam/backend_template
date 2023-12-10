import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  PutCommand,
  ScanCommand,
  DynamoDBDocumentClient,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';

import { getDate, getKoreanDayOfWeek } from '../utils';
import { ChallengeInputMapper, Pagination } from './challenges.dto';

@Injectable()
export class ChallengeRepository {
  private readonly dbClient: DynamoDBDocumentClient;
  private tableName = 'Challenges';

  constructor(private readonly configService: ConfigService) {
    const client = new DynamoDBClient({
      endpoint: this.configService.get('AWS_ENDPOINT'),
      region: this.configService.get('AWS_REGION'),
    });
    this.dbClient = DynamoDBDocumentClient.from(client);
  }

  async createChallenge(challengeInputMapper: ChallengeInputMapper) {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: challengeInputMapper,
    });

    try {
      const response = await this.dbClient.send(command);

      return response;
    } catch (error) {
      throw new Error(`Could not create challenge: ${error.message}`);
    }
  }

  async getChallenges({ limit, lastKey, userId }: Pagination) {
    const today = new Date().toISOString();
    const scanCommand = new ScanCommand({
      TableName: this.tableName,
      FilterExpression:
        'startDate <= :today AND endDate >= :today AND contains(actionDay, :todayDayOfWeek) AND userId = :userId',
      ExpressionAttributeValues: {
        ':today': today,
        ':todayDayOfWeek': getKoreanDayOfWeek(),
        ':userId': userId,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey ? { id: lastKey } : undefined,
    });

    try {
      const response = await this.dbClient.send(scanCommand);

      return {
        items: response.Items,
        lastKey: response.LastEvaluatedKey?.id,
      };
    } catch (error) {
      throw new Error(`Could not retrieve challenges: ${error.message}`);
    }
  }

  async getMyAchievements({ limit, lastKey, userId }: Pagination) {
    const scanCommand = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'totalDays = completeCount AND userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey ? { id: lastKey } : undefined,
    });

    try {
      const response = await this.dbClient.send(scanCommand);
      return {
        items: response.Items,
        lastEvaluatedKey: response.LastEvaluatedKey,
      };
    } catch (error) {
      throw new Error(`Could not retrieve my achievements: ${error.message}`);
    }
  }

  async getAchievements({ limit, lastKey, userId }: Pagination) {
    const scanCommand = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'endDate >= :today AND userId = :userId',
      ExpressionAttributeValues: {
        ':today': new Date().toISOString(),
        ':userId': userId,
      },
      Limit: limit,
      ExclusiveStartKey: lastKey ? { id: lastKey } : undefined,
    });

    try {
      const response = await this.dbClient.send(scanCommand);
      console.log(response);
      return {
        items: response.Items,
        lastEvaluatedKey: response.LastEvaluatedKey.id,
      };
    } catch (error) {
      throw new Error(`Could not retrieve achievements: ${error.message}`);
    }
  }

  async updateChallengeStatus(challengeId: string, status: boolean) {
    const params = {
      TableName: this.tableName,
      Key: {
        id: challengeId,
      },
      UpdateExpression:
        'SET completeStatus.#date = :value, ADD completeCount :val',
      ExpressionAttributeNames: {
        '#date': getDate(),
      },
      ExpressionAttributeValues: {
        ':value': status,
        ':val': status ? 1 : -1,
      },
    };

    try {
      const command = new UpdateCommand(params);
      const result = await this.dbClient.send(command);
      console.log('UpdateItem succeeded:', result);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }
}
