import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  constructor(private readonly configService: ConfigService) {}

  async generateText(prompt: string, context?: string) {
    // Shared adapter for OpenAI API or Gemini API
    const apiKey = this.configService.get<string>('AI_API_KEY');
    return {
      prompt,
      response: 'AI response simulated for prototype. Configure AI_API_KEY in .env for production integration.',
    };
  }
}
