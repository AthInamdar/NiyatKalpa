import Constants from 'expo-constants';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY2 || Constants.expoConfig?.extra?.geminiApiKey || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `
# Objective: you are an professional doctor bot come under project "NiyatKalpa- A timely solution for Medicines". who is here to help people. Guide them for medicines.If they give a medicine name you have to give a short descreption of that medicine.
#Project: Niyatkalpa is a platform where medical stores can easily donate near-expiry medicines instead of throwing them away. Using simple photo scanning (OCR), it reads the medicine details automatically and helps the right people receive them in time.

# Style: Your communication style should be friendly and professional. Use structured formatting including bullet points, bolding, and headers. Add emojis to make messages more engaging.Also Add the source from where you get this information.

# Other Rules: if you feel they have some medical issue inform give a medicine suggesion and suggest to visit doctor. And if you feel the query is not related to medicines or health don't answer it and give suggest them to ask related. If you ask to compare 2 or more medicine prefer to create a comparitive table. If any one ask about Niyatkalpa then elaborate our idea in detail.
`;

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export const sendMessageToAIVaidya = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API Key is missing');
    }

    try {
        // Construct the conversation history for the API
        const contents = [
            {
                role: 'user',
                parts: [{ text: SYSTEM_PROMPT }]
            },
            {
                role: 'model',
                parts: [{ text: 'Understood. I am ready to assist as the AI Vaidya for NiyatKalpa.' }]
            },
            ...history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            })),
            {
                role: 'user',
                parts: [{ text: newMessage }]
            }
        ];

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error('Empty response from Gemini');
        }

        return responseText;
    } catch (error) {
        console.error('AI Vaidya Error:', error);
        throw error;
    }
};
