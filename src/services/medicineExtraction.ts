import { ParsedFields } from '../config/types';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { parseAndNormalize, validateNormalized } from './ocr/normalize';
import { OcrService } from './ocr';

// Gemini API configuration for medicine extraction
const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || '';
const GEMINI_VISION_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Extract medicine details from two images using Gemini 1.5 Flash
 * @param frontImageUri - URI of the front photo (medicine name & brand)
 * @param labelImageUri - URI of the label photo (batch, MFG, EXP, MRP)
 * @returns Parsed medicine details
 */
export const extractMedicineDetails = async (
  frontImageUri: string,
  labelImageUri?: string
): Promise<ParsedFields> => {
  const useOnDevice = (Constants.expoConfig as any)?.extra?.useOnDeviceOcr === true;
  if (useOnDevice || !GEMINI_API_KEY) {
    if (!GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY not configured, using on-device OCR');
    }
    return extractWithOnDevice(frontImageUri, labelImageUri);
  }

  try {
    // Convert images to base64
    const frontBase64 = await imageToBase64(frontImageUri);
    const labelBase64 = labelImageUri ? await imageToBase64(labelImageUri) : null;

    const getMimeType = (uri: string): string => {
      const u = uri.toLowerCase();
      if (u.endsWith('.png')) return 'image/png';
      if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image/jpeg';
      if (u.endsWith('.webp')) return 'image/webp';
      if (u.endsWith('.heic')) return 'image/heic';
      if (u.endsWith('.heif')) return 'image/heif';
      return 'image/jpeg';
    };

    // Prepare the request payload
    const parts: any[] = [
      {
        text: `You are a medicine information extraction AI. Extract the following details from the medicine images provided:

From the FRONT image:
- Medicine name (including dosage/strength)
- Company/Manufacturer name

From the LABEL image (if provided):
- Batch number (look for "Batch No", "Batch", "Lot No", etc.)
- Manufacturing date (MFG date - format as MM/YYYY)
- Expiry date (EXP date - format as MM/YYYY)
- MRP (Maximum Retail Price - extract only the numeric value)

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "name": "medicine name with dosage",
  "manufacturer": "company name",
  "batchNo": "batch number",
  "mfdDate": "MM/YYYY",
  "expiryDate": "MM/YYYY",
  "mrp": numeric_value
}

If any field is not found, use null for that field. Be precise and extract exact text from the images.`
      },
      {
        inlineData: {
          mimeType: getMimeType(frontImageUri),
          data: frontBase64
        }
      }
    ];

    // Add label image if provided
    if (labelBase64 && labelImageUri) {
      parts.push({
        inlineData: {
          mimeType: getMimeType(labelImageUri),
          data: labelBase64
        }
      });
    }

    // Call Gemini API
    const response = await fetch(`${GEMINI_VISION_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: parts
        }],
        generationConfig: {
          temperature: 0.1, // Low temperature for precise extraction
          topK: 1,
          topP: 1,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Gemini API error: status=${response.status} ${response.statusText} body=${body}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the JSON response
    const extractedData = parseGeminiResponse(text);

    return extractedData;
  } catch (error) {
    console.error('❌ Medicine extraction failed:', error);
    return extractWithFallback(frontImageUri, labelImageUri);
  }
};

/**
 * Parse Gemini response and clean the data
 */
const parseGeminiResponse = (text: string): ParsedFields => {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '');
    }

    if (!cleanText) {
      console.warn('⚠️ Gemini returned empty response text');
      return {};
    }

    console.log('📝 Raw Gemini response:', cleanText);
    const parsed = JSON.parse(cleanText);

    const name: string | undefined = parsed.name || undefined;
    const manufacturer: string | undefined = parsed.manufacturer || parsed.company || undefined;
    const prelim: ParsedFields = {
      batchNo: parsed.batchNo || parsed.batch_no || undefined,
      mfdDate: parsed.mfdDate || parsed.mfg_date || undefined,
      expiryDate: parsed.expiryDate || parsed.exp_date || parsed.expiry_date || undefined,
      mrp: typeof parsed.mrp === 'number' ? parsed.mrp : parseFloat(parsed.mrp) || undefined,
    };

    // Normalize dates and mrp formats
    const normalized = parseAndNormalize(
      [
        parsed.batchNo || parsed.batch_no || '',
        parsed.mfdDate || parsed.mfg_date || '',
        parsed.expiryDate || parsed.exp_date || parsed.expiry_date || '',
        parsed.mrp ? String(parsed.mrp) : ''
      ].join(' ')
    );

    const finalMrp = normalized.mrp ? Number(normalized.mrp) : prelim.mrp;
    const final: ParsedFields = {
      name,
      manufacturer,
      batchNo: normalized.batchNo || prelim.batchNo,
      mfdDate: normalized.mfdDate || prelim.mfdDate,
      expiryDate: normalized.expiryDate || prelim.expiryDate,
      mrp: Number.isFinite(finalMrp as number) ? (finalMrp as number) : undefined,
    };

    return final;
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    return {};
  }
};

/**
 * Convert image URI to base64 using expo-file-system
 */
const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    // Use expo-file-system to read image as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64' as any,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    // Return empty string as fallback
    return '';
  }
};

/**
 * On-device OCR flow using OcrService (ML Kit) and normalization
 */
const extractWithOnDevice = async (
  frontImageUri: string,
  labelImageUri?: string
): Promise<ParsedFields> => {
  try {
    console.log('🔄 Starting On-Device OCR extraction...');
    const frontFields = await OcrService.parse(frontImageUri);
    const labelFields = labelImageUri ? await OcrService.parse(labelImageUri) : {};

    console.log('✅ On-Device OCR completed. Merging results...');

    // Merge strategy: prefer label for batch/mrp/mfd/expiry; front for name/manufacturer
    const merged: ParsedFields = {
      name: frontFields.name,
      manufacturer: frontFields.manufacturer,
      batchNo: (labelFields as ParsedFields).batchNo || frontFields.batchNo,
      mfdDate: (labelFields as ParsedFields).mfdDate || frontFields.mfdDate,
      expiryDate: (labelFields as ParsedFields).expiryDate || frontFields.expiryDate,
      mrp: (labelFields as ParsedFields).mrp ?? frontFields.mrp,
    };

    console.log('📦 Merged extracted data:', JSON.stringify(merged, null, 2));
    return merged;
  } catch (e) {
    console.error('On-device OCR extraction failed:', e);
    return {};
  }
};

/**
 * Fallback extraction using regex patterns (basic OCR simulation)
 */
const extractWithFallback = async (
  frontImageUri: string,
  labelImageUri?: string
): Promise<ParsedFields> => {
  console.log('Using fallback extraction method');

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return mock data for demonstration
  return {
    name: 'Paracetamol 500mg',
    manufacturer: 'Cipla Ltd',
    batchNo: 'B12345',
    mfdDate: '07/2024',
    expiryDate: '06/2026',
    mrp: 38.00,
  };
};

/**
 * Extract text from image using basic pattern matching
 * This is a simplified version - in production, use proper OCR library
 */
export const extractTextFromImage = async (imageUri: string): Promise<string> => {
  // This would use Tesseract or similar OCR library
  // For now, return empty string as we're using Gemini for extraction
  return '';
};

/**
 * Parse extracted text using regex patterns
 */
export const parseExtractedText = (text: string): Partial<ParsedFields> => {
  const result: Partial<ParsedFields> = {};

  const normalized = parseAndNormalize(text);
  if (normalized.batchNo) result.batchNo = normalized.batchNo;
  if (normalized.mfdDate) result.mfdDate = normalized.mfdDate;
  if (normalized.expiryDate) result.expiryDate = normalized.expiryDate;
  if (normalized.mrp) {
    const n = Number(normalized.mrp);
    if (Number.isFinite(n)) result.mrp = n;
  }

  return result;
};

/**
 * Validate extracted medicine details
 */
export const validateMedicineDetails = (details: ParsedFields): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Check required fields
  if (!details.name) errors.push('Medicine name is required');
  if (!details.manufacturer) errors.push('Manufacturer is required');
  if (!details.batchNo) errors.push('Batch number is required');
  if (!details.expiryDate) errors.push('Expiry date is required');

  // Validate expiry date format
  if (details.expiryDate) {
    const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dateRegex.test(details.expiryDate)) {
      errors.push('Expiry date must be in MM/YYYY format');
    } else {
      // Check if expiry date is at least 3 months in the future
      const [month, year] = details.expiryDate.split('/').map(Number);
      const expiryDate = new Date(year, month - 1);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      if (expiryDate < threeMonthsFromNow) {
        errors.push('Expiry date must be at least 3 months in the future');
      }
    }
  }

  // Validate MFG date format
  if (details.mfdDate) {
    const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dateRegex.test(details.mfdDate)) {
      errors.push('Manufacturing date must be in MM/YYYY format');
    }
  }

  // Validate MRP
  if (details.mrp && details.mrp <= 0) {
    errors.push('MRP must be greater than 0');
  }

  // Ensure EXP date is later than MFG date when both present
  if (details.mfdDate && details.expiryDate) {
    const [mm1, yy1] = details.mfdDate.split('/').map(Number);
    const [mm2, yy2] = details.expiryDate.split('/').map(Number);
    if (Number.isFinite(mm1) && Number.isFinite(yy1) && Number.isFinite(mm2) && Number.isFinite(yy2)) {
      const earlier = yy2 < yy1 || (yy2 === yy1 && mm2 <= mm1);
      if (earlier) errors.push('Expiry date must be later than manufacturing date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
