export class ChallengeDto {
  readonly name: string;
  readonly type: string;
  readonly goal: string;
  readonly actionDay: string[];
  readonly badge: string;
  readonly completedRatio: number;
  readonly startDate: string;
  readonly endDate: string;
}

export class ChallengeOutput {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly goal: string;
  readonly actionDay: string[];
  readonly badge: string;
  readonly completedRatio: number;
  readonly startDate: Date;
  readonly endDate: Date;
}
