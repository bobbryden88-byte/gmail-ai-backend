const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  async generateEmailResponse(emailContent, style = 'brief') {
    try {
      const prompt = this.buildPrompt(emailContent, style);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that helps write professional email responses. Always respond with valid JSON containing summary, responses, and actions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      return {
        success: true,
        response: response.choices[0].message.content,
        tokensUsed: response.usage.total_tokens,
        cost: this.calculateCost(response.usage)
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  buildPrompt(emailContent, style) {
    return `
Analyze this email and generate response suggestions in ${style} style:

Email: "${emailContent.body}"
From: ${emailContent.sender}
Subject: ${emailContent.subject}

Respond with JSON in this exact format:
{
  "summary": "Brief summary of the email",
  "responses": [
    {
      "label": "Response Type",
      "text": "Full response text"
    }
  ],
  "actions": ["action item 1", "action item 2"]
}
    `;
  }

  calculateCost(usage) {
    const inputCost = (usage.prompt_tokens / 1000) * 0.01;
    const outputCost = (usage.completion_tokens / 1000) * 0.03;
    return inputCost + outputCost;
  }
}

module.exports = new OpenAIService();
