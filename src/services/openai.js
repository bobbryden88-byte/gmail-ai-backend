const OpenAI = require('openai');

// Initialize OpenAI client - will be recreated with fresh key on each request
function getOpenAIClient() {
  // Get raw key from environment
  const rawKey = process.env.OPENAI_API_KEY;
  const apiKey = rawKey?.trim();
  
  console.log('🔍 Raw environment check:', {
    hasRawKey: !!rawKey,
    rawKeyLength: rawKey?.length || 0,
    hasTrimmedKey: !!apiKey,
    trimmedKeyLength: apiKey?.length || 0,
    rawKeyType: typeof rawKey,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('OPENAI')).join(', ')
  });
  
  if (!apiKey) {
    console.error('⚠️ OPENAI_API_KEY is not set in environment variables!');
    throw new Error('OPENAI_API_KEY is required but not set');
  }

  // Log key status (without exposing the full key) - CRITICAL DEBUG INFO
  const keyInfo = {
    hasKey: !!apiKey,
    keyLength: apiKey.length,
    keyPrefix: apiKey.substring(0, 30) + '...',
    keySuffix: '...' + apiKey.substring(apiKey.length - 20),
    keyFirst30: apiKey.substring(0, 30),
    keyLast30: apiKey.substring(apiKey.length - 30),
    keyStartsWith: apiKey.startsWith('sk-proj-'),
    keyEndsWith: apiKey.endsWith('ULL4_mmoA') ? '...ULL4_mmoA ✅' : `...${apiKey.substring(apiKey.length - 10)} ❌`
  };
  console.log('🔑 Creating OpenAI client with key:', JSON.stringify(keyInfo, null, 2));

  // Recreate client to ensure fresh key is used
  const client = new OpenAI({
    apiKey: apiKey,
  });
  
  console.log('✅ OpenAI client created successfully');
  return client;
}

class OpenAIService {
  async generateEmailResponse(emailContent, style = 'brief', mode = 'response') {
    try {
      // Verify API key before making request
      const apiKey = process.env.OPENAI_API_KEY?.trim();
      if (!apiKey) {
        console.error('❌ OPENAI_API_KEY is missing or empty');
        return {
          success: false,
          error: 'OpenAI API key is not configured'
        };
      }

      console.log('🔑 API Key Check:', {
        hasKey: !!apiKey,
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 15) + '...',
        keySuffix: '...' + apiKey.substring(apiKey.length - 10)
      });

      const prompt = mode === 'compose' ? 
        this.buildComposePrompt(emailContent, style) : 
        this.buildResponsePrompt(emailContent, style);
      
      console.log('📤 Sending request to OpenAI:', {
        model: 'gpt-4o-mini',
        promptLength: prompt.length,
        mode: mode
      });

      // Get fresh OpenAI client with current API key
      const openai = getOpenAIClient();

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for better availability and cost
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

      console.log('✅ OpenAI response received:', {
        hasContent: !!response.choices[0]?.message?.content,
        tokensUsed: response.usage?.total_tokens
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
