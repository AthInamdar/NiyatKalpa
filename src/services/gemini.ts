import { VedAIResponse } from '../config/types';

// Gemini API configuration
// Note: Add GEMINI_API_KEY to your .env file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Call Gemini API for chat responses
 */
export const callGeminiAPI = async (prompt: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not configured, using fallback responses');
    return getFallbackResponse(prompt);
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return text;
  } catch (error) {
    console.error('❌ Gemini API call failed:', error);
    return getFallbackResponse(prompt);
  }
};

/**
 * Ved Chatbot - Donation and NGO assistance
 */
export const askVed = async (question: string, context?: 'donation' | 'request' | 'general'): Promise<VedAIResponse> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerQuestion = question.toLowerCase();

  // Context-aware prompts
  let systemPrompt = '';
  if (context === 'donation') {
    systemPrompt = 'You are Ved, an AI assistant helping donors with medicine donations. Provide guidance on donation processes, medicine handling, and connecting with NGOs. ';
  } else if (context === 'request') {
    systemPrompt = 'You are Ved, an AI assistant helping NGOs request medicines. Provide guidance on creating requests, matching with donors, and receiving donations. ';
  } else {
    systemPrompt = 'You are Ved, an AI assistant for NiyatKalpa medicine donation platform. Help users with donations, requests, and general medicine information. ';
  }

  const fullPrompt = `${systemPrompt}\n\nUser question: ${question}\n\nProvide a helpful, concise response.`;

  try {
    const answer = await callGeminiAPI(fullPrompt);
    
    // Generate suggestions based on context
    const suggestions = generateSuggestions(lowerQuestion, context);

    return {
      question,
      answer: answer || getFallbackResponse(question),
      context,
      suggestions,
    };
  } catch (error) {
    console.error('Error in askVed:', error);
    return {
      question,
      answer: getFallbackResponse(question),
      context,
      suggestions: [],
    };
  }
};

/**
 * Get AI matching recommendations
 */
export const getMatchingRecommendations = async (
  donationName: string,
  requestName: string,
  distance: number,
  urgency: string
): Promise<string> => {
  const prompt = `As an AI matching assistant for medicine donations, analyze this potential match:
  
Donation: ${donationName}
Request: ${requestName}
Distance: ${distance} km
Urgency: ${urgency}

Provide a brief recommendation (2-3 sentences) on whether this is a good match and why.`;

  try {
    const recommendation = await callGeminiAPI(prompt);
    return recommendation || 'This appears to be a suitable match based on medicine compatibility and proximity.';
  } catch (error) {
    console.error('Error getting matching recommendations:', error);
    return 'Unable to generate recommendation at this time.';
  }
};

/**
 * Generate contextual suggestions
 */
const generateSuggestions = (question: string, context?: string): string[] => {
  const suggestions: string[] = [];

  if (context === 'donation') {
    suggestions.push(
      'How do I upload a medicine donation?',
      'What information do I need for donation?',
      'How are donations matched with NGOs?'
    );
  } else if (context === 'request') {
    suggestions.push(
      'How do I create a medicine request?',
      'How long does matching take?',
      'How do I confirm a donation match?'
    );
  } else {
    if (question.includes('donate') || question.includes('donation')) {
      suggestions.push(
        'How to donate medicines?',
        'What medicines can I donate?',
        'Donation requirements'
      );
    } else if (question.includes('request') || question.includes('ngo')) {
      suggestions.push(
        'How to request medicines?',
        'NGO verification process',
        'Tracking requests'
      );
    } else {
      suggestions.push(
        'How does NiyatKalpa work?',
        'Donation process',
        'NGO registration'
      );
    }
  }

  return suggestions.slice(0, 3);
};

/**
 * Fallback responses when Gemini API is unavailable
 */
const getFallbackResponse = (question: string): string => {
  const lowerQuestion = question.toLowerCase();

  // Donation-related
  if (lowerQuestion.includes('donate') || lowerQuestion.includes('donation')) {
    return 'To donate medicines, go to the Donate tab, take photos of your medicine packaging, and our OCR system will extract the details. You can then review and submit your donation. Our AI will match it with NGOs in need.';
  }

  // Request-related
  if (lowerQuestion.includes('request') || lowerQuestion.includes('ngo')) {
    return 'NGOs can create medicine requests by specifying the medicine name, quantity needed, and urgency level. Our AI matching system will find suitable donations and notify you when matches are available.';
  }

  // Matching-related
  if (lowerQuestion.includes('match') || lowerQuestion.includes('connect')) {
    return 'Our AI matching system considers medicine compatibility, distance between donor and NGO, urgency level, and expiry dates to find the best matches. Both parties must confirm before establishing a connection.';
  }

  // Verification
  if (lowerQuestion.includes('verify') || lowerQuestion.includes('verification')) {
    return 'All donors and NGOs undergo verification by our admin team. NGOs need to provide registration documents, and donors may need to verify their organization credentials for large-scale donations.';
  }

  // General
  return 'NiyatKalpa is a medicine donation platform connecting donors (companies, pharmacies) with NGOs and charities. We use AI to match donations with requests based on need, location, and urgency. How can I help you specifically?';
};

/**
 * Get medicine information (for educational purposes)
 */
export const getMedicineInfo = async (medicineName: string): Promise<string> => {
  const prompt = `Provide brief, factual information about the medicine "${medicineName}". Include:
1. Common uses
2. Important precautions
3. Storage requirements

Keep it concise (3-4 sentences) and emphasize consulting healthcare professionals.`;

  try {
    const info = await callGeminiAPI(prompt);
    return info || 'Please consult a healthcare professional for specific medicine information.';
  } catch (error) {
    console.error('Error getting medicine info:', error);
    return 'Please consult a healthcare professional for specific medicine information.';
  }
};
