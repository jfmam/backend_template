import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  PutCommand,
  QueryCommand,
  ScanCommand,
  DynamoDBDocumentClient,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';

import { getDate, getKoreanDayOfWeek } from '../utils';
import { ChallengeInputMapper } from './challenges.dto';

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

  async getChallenges(
    limit: number,
    lastEvaluatedKey?: Record<string, string>,
  ) {
    const today = new Date().toISOString();

    const scanCommand = new ScanCommand({
      TableName: this.tableName,
      FilterExpression:
        'startDate <= :today AND endDate >= :today AND contains(actionDay, :todayDayOfWeek)',
      ExpressionAttributeValues: {
        ':today': today,
        ':todayDayOfWeek': getKoreanDayOfWeek(),
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    try {
      const response = await this.dbClient.send(scanCommand);

      return {
        items: response.Items,
        lastEvaluatedKey: response.LastEvaluatedKey,
      };
    } catch (error) {
      throw new Error(`Could not retrieve challenges: ${error.message}`);
    }
  }

  async getMyAchievements(
    limit: number,
    lastEvaluatedKey?: Record<string, string>,
  ) {
    const scanCommand = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'totalDays = completeCount',
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
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

  async getAchievements(
    limit: number,
    lastEvaluatedKey?: Record<string, string>,
  ) {
    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'EndDateIndex',
      KeyConditionExpression: '#end_date > :today',
      ExpressionAttributeNames: {
        '#end_date': 'endDate',
      },
      ExpressionAttributeValues: {
        ':today': getDate(),
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    try {
      const response = await this.dbClient.send(queryCommand);
      return {
        items: response.Items,
        lastEvaluatedKey: response.LastEvaluatedKey,
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
