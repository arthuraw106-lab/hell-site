import { Injectable, Logger } from '@nestjs/common';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async askRegisBot(userMessage: string) {
    const enabled = process.env.AI_BOT_ENABLED !== 'false';

    if (!enabled) {
      return this.fallbackReply();
    }

    const baseUrl = process.env.AI_BASE_URL || 'https://api.freemodel.dev/v1';
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      this.logger.warn('AI_API_KEY is missing. Falling back to local reply.');
      return this.fallbackReply();
    }

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'تو رجیس‌بات هستی؛ یک ربات خودمونی، خوش‌صحبت و بامزه داخل سایت هل مانهوا. ' +
          'با کاربرا فارسی و دوستانه حرف بزن. درباره مانهوا، وب‌تون، شخصیت‌ها، پیشنهاد اثر، تئوری داستان و حال‌وهوای چپترها کمک کن. ' +
          'لحن تو صمیمی و کمی شوخ است، ولی محترمانه. جواب‌ها کوتاه، کاربردی و جذاب باشند. ' +
          'اگر سؤال نامرتبط بود، مودبانه جواب بده و گفتگو را به سمت مانهوا برگردان. ' +
          'هیچ‌وقت ادعا نکن به دیتابیس خصوصی سایت دسترسی مستقیم داری، مگر اطلاعات در پیام کاربر آمده باشد.',
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.85,
          max_tokens: 450,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        this.logger.warn(`AI request failed: ${response.status} ${text}`);
        return this.fallbackReply();
      }

      const data = await response.json();

      const content =
        data?.choices?.[0]?.message?.content ||
        data?.choices?.[0]?.text ||
        '';

      if (!content || typeof content !== 'string') {
        return this.fallbackReply();
      }

      return content.trim();
    } catch (error) {
      this.logger.warn(error instanceof Error ? error.message : String(error));
      return this.fallbackReply();
    }
  }

  private fallbackReply() {
    return 'رجیس‌بات: الان یکم ارتباطم با مغز هوش مصنوعی قطع و وصله 😅 ولی اگه دنبال مانهوا خفن می‌گردی، از اکشن تاریک شروع کن؛ همیشه جواب می‌ده!';
  }
}
