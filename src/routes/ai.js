const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const openaiService = require('../services/openai');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { error: 'Too many AI requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Usage checking middleware
const checkUsageLimit = async (req, res, next) => {
  try {
    const user = req.user;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get fresh user data
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if we need to reset daily counter
    const lastUsageDate = currentUser.lastUsageDate;
    const isNewDay = !lastUsageDate || 
                     lastUsageDate.toDateString() !== today.toDateString();

    // Check if we need to reset monthly counter
    const lastResetDate = currentUser.lastResetDate;
    const isNewMonth = !lastResetDate || 
                       lastResetDate.getMonth() !== currentMonth ||
                       lastResetDate.getFullYear() !== currentYear;

    console.log('📊 Usage check:', {
      userId: user.id,
      isNewDay,
      isNewMonth,
      currentDaily: currentUser.dailyUsage,
      currentMonthly: currentUser.monthlyUsage
    });

    // Reset counters if needed
    if (isNewDay || isNewMonth) {
      const updateData = {};
      
      if (isNewDay) {
        updateData.dailyUsage = 0;
        updateData.lastUsageDate = today;
      }
      
      if (isNewMonth) {
        updateData.monthlyUsage = 0;
        updateData.lastResetDate = today;
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
      
      currentUser.dailyUsage = updateData.dailyUsage !== undefined ? updateData.dailyUsage : currentUser.dailyUsage;
      currentUser.monthlyUsage = updateData.monthlyUsage !== undefined ? updateData.monthlyUsage : currentUser.monthlyUsage;
    }

    // Define limits
    const LIMITS = {
      daily: currentUser.isPremium ? 100 : 10,
      monthly: currentUser.isPremium ? 3000 : 300
    };

    // Check daily limit
    if (currentUser.dailyUsage >= LIMITS.daily) {
      return res.status(429).json({
        error: 'Daily usage limit exceeded',
        type: 'daily_limit',
        used: currentUser.dailyUsage,
        limit: LIMITS.daily,
        isPremium: currentUser.isPremium,
        upgradeUrl: process.env.UPGRADE_URL
      });
    }

    // Check monthly limit
    if (currentUser.monthlyUsage >= LIMITS.monthly) {
      return res.status(429).json({
        error: 'Monthly usage limit exceeded',
        type: 'monthly_limit',
        used: currentUser.monthlyUsage,
        limit: LIMITS.monthly,
        isPremium: currentUser.isPremium,
        upgradeUrl: process.env.UPGRADE_URL
      });
    }

    // Update req.user with current usage
    req.user = currentUser;
    
    next();

  } catch (error) {
    console.error('Error in checkUsageLimit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Test endpoint without authentication (for Chrome extension testing)
router.post('/generate-test', async (req, res) => {
  try {
    const { emailContent, style = 'brief', mode = 'response' } = req.body;

    // For compose mode, we need description instead of body
    if (mode === 'compose') {
      if (!emailContent || !emailContent.description) {
        return res.status(400).json({ error: 'Email description is required for compose mode' });
      }
    } else {
      if (!emailContent || !emailContent.body) {
        return res.status(400).json({ error: 'Email content is required' });
      }
    }

    console.log('Test AI request received:', { emailContent, style, mode });

    // Generate AI response
    const result = await openaiService.generateEmailResponse(emailContent, style, mode);

    if (!result.success) {
      return res.status(500).json({ error: 'Failed to generate response' });
    }

    // Parse the AI response to extract the JSON
    let parsedResponse;
    try {
      console.log('Parsing AI response:', result.response.substring(0, 200) + '...');
      
      // Remove the markdown code blocks if present
      let cleanResponse = result.response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      parsedResponse = JSON.parse(cleanResponse);
      console.log('✅ Successfully parsed AI response');
      
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError.message);
      console.log('Raw response was:', result.response);
      
      // If parsing fails, return a simple response
      parsedResponse = {
        summary: "Email processed (parsing failed)",
        responses: [
          {
            label: "Generated Response",
            text: result.response
          }
        ],
        actions: ["Review response"]
      };
    }

    // Ensure responses is an array with proper structure
    if (!Array.isArray(parsedResponse.responses)) {
      parsedResponse.responses = [];
    }

    // Log what we're sending back
    console.log('Sending response:', {
      summary: parsedResponse.summary,
      responsesCount: parsedResponse.responses.length,
      actionsCount: parsedResponse.actions?.length || 0
    });

    res.json({
      success: true,
      summary: parsedResponse.summary || 'Email analyzed',
      responses: parsedResponse.responses || [],
      actions: parsedResponse.actions || [],
      usage: {
        dailyUsed: 1,
        dailyLimit: 10
      }
    });

  } catch (error) {
    console.error('Test AI generation error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Generate AI response
router.post('/generate', authenticateToken, aiRateLimit, checkUsageLimit, async (req, res) => {
  try {
    const { emailContent, style = 'brief', mode = 'response' } = req.body;

    // For compose mode, we need description instead of body
    if (mode === 'compose') {
      if (!emailContent || !emailContent.description) {
        return res.status(400).json({ error: 'Email description is required for compose mode' });
      }
    } else {
      if (!emailContent || !emailContent.body) {
        return res.status(400).json({ error: 'Email content is required' });
      }
    }

    // Generate AI response
    const result = await openaiService.generateEmailResponse(emailContent, style, mode);

    if (!result.success) {
      return res.status(500).json({ error: 'Failed to generate response' });
    }

    // Parse the AI response to extract the JSON
    let parsedResponse;
    try {
      console.log('Parsing AI response (authenticated):', result.response.substring(0, 200) + '...');
      
      // Remove the markdown code blocks if present
      let cleanResponse = result.response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      parsedResponse = JSON.parse(cleanResponse);
      console.log('✅ Successfully parsed AI response (authenticated)');
      
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError.message);
      console.log('Raw response was:', result.response);
      
      // If parsing fails, return a simple response
      parsedResponse = {
        summary: "Email processed (parsing failed)",
        responses: [
          {
            label: "Generated Response",
            text: result.response
          }
        ],
        actions: ["Review response"]
      };
    }

    // Ensure responses is an array with proper structure
    if (!Array.isArray(parsedResponse.responses)) {
      parsedResponse.responses = [];
    }

    // Update user usage and get updated values
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        dailyUsage: { increment: 1 },
        monthlyUsage: { increment: 1 }
      }
    });

    // Log what we're sending back
    console.log('Sending authenticated response:', {
      summary: parsedResponse.summary,
      responsesCount: parsedResponse.responses.length,
      actionsCount: parsedResponse.actions?.length || 0,
      dailyUsage: updatedUser.dailyUsage,
      monthlyUsage: updatedUser.monthlyUsage
    });

    res.json({
      success: true,
      summary: parsedResponse.summary || 'Email analyzed',
      responses: parsedResponse.responses || [],
      actions: parsedResponse.actions || [],
      usage: {
        dailyUsed: updatedUser.dailyUsage,
        monthlyUsed: updatedUser.monthlyUsage,
        dailyLimit: updatedUser.isPremium ? 100 : 10,
        monthlyLimit: updatedUser.isPremium ? 3000 : 300
      }
    });

  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user usage stats
router.get('/usage', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  res.json({
    dailyUsage: user.dailyUsage,
    monthlyUsage: user.monthlyUsage,
    dailyLimit: user.isPremium ? 100 : 10,
    isPremium: user.isPremium
  });
});

module.exports = router;
