export class ChallengeDto {
  readonly name: string;
  readonly type: string;
  readonly goal: string;
  readonly actionDay: string[];
  readonly badge: string;
  // readonly completedRatio: number;
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
  readonly completeStatus: Array<{ [key: string]: boolean }>;
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
  readonly completeStatus: { [key: string]: boolean };
  readonly totalDays: number;
  // readonly dailyProgressRatio: number;
}

export class ChallengeToggleDto {
  readonly status: boolean;
}

export class Pagination {
  limit: number;
  userId: string;
  lastKey?: string;
}
