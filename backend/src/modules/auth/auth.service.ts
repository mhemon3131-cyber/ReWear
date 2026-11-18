import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  async login(loginDto: LoginDto) {
    const isStudent = loginDto.email.includes('.edu') || loginDto.email.includes('.ac.bd');
    return {
      success: true,
      accessToken: 'jwt_mock_token_rewear_demo',
      user: {
        email: loginDto.email,
        name: loginDto.email.split('@')[0],
        swapCredits: 120,
        isStudentVerified: isStudent,
        role: 'student_buyer_swapper',
      },
    };
  }

  async register(registerDto: RegisterDto) {
    return {
      success: true,
      message: 'Student account created successfully',
      user: {
        name: registerDto.name,
        email: registerDto.email,
        swapCredits: 50,
      },
    };
  }
}
