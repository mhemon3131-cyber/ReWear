export class UserEntity {
  id: string;
  name: string;
  email: string;
  university?: string;
  isStudentVerified: boolean;
  swapCreditBalance: number;
  reputationScore: number;
  createdAt: Date;
}
