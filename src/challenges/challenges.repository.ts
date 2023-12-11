import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  PutCommand,
  DynamoDBDocumentClient,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';

import { getKoreanDayOfWeek } from '../utils';
import {
  ChallengeInputMapper,
  ChallengeOutputMapper,
  ChallengeToggleDto,
  Pagination,
} from './challenges.dto';

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
    const scanCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'userIdIndex',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression:
        'startDate <= :today AND endDate >= :today AND contains(actionDay, :todayDayOfWeek)',
      ExpressionAttributeValues: {
        ':today': today,
        ':todayDayOfWeek': getKoreanDayOfWeek(),
        ':userId': userId,
      },
      Limit: limit,
      ScanIndexForward: false, // 역순으로 가져오도록 설정
      ExclusiveStartKey: lastKey ? { id: lastKey, userId } : undefined,
    });

    try {
      const response = await this.dbClient.send(scanCommand);

      return {
        items: response.Items as ChallengeOutputMapper[],
        lastKey: response.LastEvaluatedKey?.id,
      };
    } catch (error) {
      throw new Error(`Could not retrieve challenges: ${error.message}`);
    }
  }

  async getMyAchievements({ limit, lastKey, userId }: Pagination) {
    const scanCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'userIdIndex',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'totalDays = completeCount',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: lastKey ? { id: lastKey, userId } : undefined,
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
    const scanCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'userIdIndex',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'endDate >= :today',
      ExpressionAttributeValues: {
        ':today': new Date().toISOString(),
        ':userId': userId,
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: lastKey ? { id: lastKey, userId } : undefined,
    });

    try {
      const response = await this.dbClient.send(scanCommand);

      return {
        items: response.Items,
        lastEvaluatedKey: response.LastEvaluatedKey.id,
      };
    } catch (error) {
      throw new Error(`Could not retrieve achievements: ${error.message}`);
    }
  }

  async updateChallengeStatus({ id, status, userId }: ChallengeToggleDto) {
    const today = new Date().toISOString().split('T')[0];

    const params = {
      TableName: this.tableName,
      Key: {
        id,
        userId,
      },
      UpdateExpression: 'SET #cs.#date = :value',
      ExpressionAttributeNames: {
        '#cs': 'completeStatus',
        '#date': today,
      },
      ExpressionAttributeValues: {
        ':value': status,
      },
    };
    try {
      const command = new UpdateCommand(params);
      const result = await this.dbClient.send(command);

      return result;
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }
}
