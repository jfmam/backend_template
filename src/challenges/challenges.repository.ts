import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  PutCommand,
  QueryCommand,
  ScanCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';
import { randomBytes } from 'crypto';

import { ChallengeDto } from './challenges.dto';
import { ConfigService } from '@nestjs/config';

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

  generateRandomString(): string {
    return randomBytes(10).toString('hex');
  }

  async createChallenge(challengeDto: ChallengeDto) {
    const id = this.generateRandomString();

    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        id,
        name: challengeDto.name,
        type: challengeDto.type,
        goal: challengeDto.goal,
        actionDay: challengeDto.actionDay,
        badge: challengeDto.badge,
        completedRatio: challengeDto.completedRatio,
        startDate: challengeDto.startDate,
        endDate: challengeDto.endDate,
      },
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
      FilterExpression: 'startDate <= :today AND endDate >= :today',
      ExpressionAttributeValues: {
        ':today': today,
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
      FilterExpression: '#complete_ratio = :ratio',
      ExpressionAttributeNames: {
        '#complete_ratio': 'completeRatio',
      },
      ExpressionAttributeValues: {
        ':ratio': { N: '100' },
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
        ':today': { S: new Date().toISOString().split('T')[0] },
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
}
