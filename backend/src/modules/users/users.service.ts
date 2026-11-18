import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: UserEntity[] = [
    {
      id: 'usr_01',
      name: 'Nafis Iqbal',
      email: 'member3.swap@bracu.ac.bd',
      university: 'BRAC University',
      isStudentVerified: true,
      swapCreditBalance: 150,
      reputationScore: 4.9,
      createdAt: new Date(),
    },
  ];

  async getProfile(email: string): Promise<UserEntity | null> {
    return this.users.find(u => u.email === email) || this.users[0];
  }
}
