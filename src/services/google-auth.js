const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and extract user information
 * @param {string} idToken - Google ID token from chrome.identity
 * @returns {Promise<Object>} User info: { email, name, googleId, picture }
 */
async function verifyGoogleToken(idToken) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID is not set in environment variables');
      throw new Error('GOOGLE_CLIENT_ID not configured. Please set it in environment variables.');
    }

    console.log('Verifying Google token with client ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if (!payload.email) {
      throw new Error('Email not found in Google token');
    }
    
    console.log('Google token verified successfully for:', payload.email);
    
    return {
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      googleId: payload.sub, // Google's unique user ID
      picture: payload.picture
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    throw new Error('Invalid Google token: ' + error.message);
  }
}

module.exports = {
  verifyGoogleToken
};
