const OpenAI = require('openai');

// Check if API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️ OPENAI_API_KEY is not set in environment variables!');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  async generateEmailResponse(emailContent, style = 'brief', mode = 'response') {
    try {
      const prompt = mode === 'compose' ? 
        this.buildComposePrompt(emailContent, style) : 
        this.buildResponsePrompt(emailContent, style);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: mode === 'compose' ? 
              'You are an AI assistant that helps write professional emails from scratch. Always respond with valid JSON containing summary, responses, and actions.' :
              'You are an AI assistant that helps write professional email responses. Always respond with valid JSON containing summary, responses, and actions.'
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
      console.error('OpenAI API Error Details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        hasApiKey: !!process.env.OPENAI_API_KEY,
        apiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'MISSING'
      });
      return {
        success: false,
        error: error.message || 'Unknown OpenAI API error'
      };
    }
  }

  buildResponsePrompt(emailContent, style) {
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

  buildComposePrompt(emailContent, style) {
    const recipient = emailContent.recipient || 'the recipient';
    const description = emailContent.description || 'the email content';
    
    return `
Write a professional email in ${style} style based on this description:

What to write: "${description}"
Recipient: ${recipient}

Generate a complete email with subject line and body. Respond with JSON in this exact format:
{
  "summary": "Brief description of what the email is about",
  "responses": [
    {
      "label": "Subject Line",
      "text": "Email subject line"
    },
    {
      "label": "Email Body",
      "text": "Complete email body text"
    }
  ],
  "actions": ["Send email", "Review before sending", "Add recipient"]
}
    `;
  }

  // Keep the old method for backward compatibility
  buildPrompt(emailContent, style) {
    return this.buildResponsePrompt(emailContent, style);
  }

  calculateCost(usage) {
    const inputCost = (usage.prompt_tokens / 1000) * 0.01;
    const outputCost = (usage.completion_tokens / 1000) * 0.03;
    return inputCost + outputCost;
  }
}

module.exports = new OpenAIService();
