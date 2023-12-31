export class ChallengeDto {
  readonly name: string;
  readonly type: string;
  readonly goal: string;
  readonly actionDay: string[];
  readonly badge: string;
  readonly completeCount: number;
  readonly startDate: string;
  readonly endDate: string;
}

export class ChallengeInputMapper {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly type: string;
  readonly goal: string;
  readonly actionDay: string[];
  readonly badge: string;
  readonly completeCount: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly completeStatus: { [key: string]: boolean };
  readonly totalDays: number;
}

export class ChallengeOutput {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly goal: string;
  readonly actionDay: string[];
  readonly badge: string;
  readonly completeCount: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly todayCompleteStatus: boolean;
  readonly totalDays: number;
}

export class AchievementOutput {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly goal: string;
  readonly actionDay: string[];
  readonly badge: string;
  readonly completeRatio: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly totalDays: number;
}

export class ChallengeOutputMapper {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly goal: string;
  readonly actionDay: string[];
  readonly badge: string;
  readonly completeCount: number;
  readonly startDate: string;
  readonly endDate: string;
  readonly completeStatus: { [key: string]: boolean };
  readonly totalDays: number;
}

export class ChallengeToggleDto {
  readonly status: boolean;
  readonly id: string;
  readonly userId: string;
}

export class Pagination {
  limit: number;
  userId: string;
  lastKey?: string;
}
