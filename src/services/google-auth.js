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
      throw new Error('GOOGLE_CLIENT_ID not configured');
    }

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if (!payload.email) {
      throw new Error('Email not found in Google token');
    }
    
    return {
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split('@')[0],
      googleId: payload.sub, // Google's unique user ID
      picture: payload.picture
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Invalid Google token: ' + error.message);
  }
}

module.exports = {
  verifyGoogleToken
};
