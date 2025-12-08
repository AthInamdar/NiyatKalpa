import { ParsedFields } from '../../config/types';
import { parseAndNormalize } from './normalize';

// ML Kit OCR implementation for Dev Client
// This would use expo-ml-kit or similar package in a real implementation
export const mlkitParse = async (imageUri: string): Promise<ParsedFields> => {
  try {
    // Note: This is a placeholder implementation
    // In a real app, you would use ML Kit Text Recognition
    // Example with expo-ml-kit:
    // import { TextRecognition } from 'expo-ml-kit';
    // const result = await TextRecognition.recognizeTextAsync(imageUri);
    
    // For now, we'll simulate ML Kit processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted text that would come from ML Kit
    const mockExtractedText = `
      Paracetamol Tablets 500mg
      Batch No: PCM123456
      Mfg: HealthCorp Pharmaceuticals
      Exp: 08/2024
      MRP: Rs. 45.00
    `;
    
    return parseTextToFields(mockExtractedText);
  } catch (error) {
    console.error('ML Kit OCR error:', error);
    return {};
  }
};

const parseTextToFields = (text: string): ParsedFields => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const result: ParsedFields = {};

  // Name heuristic: first substantial line without keywords
  const nameLine = lines.find(l => l.length > 5 && !/(Batch|Mfg|MFD|Exp|Expiry|MRP|Price|Rs|₹)/i.test(l));
  if (nameLine) {
    result.name = nameLine.replace(/\b(tablets?|capsules?|syrup|suspension)\b/gi, '').trim();
  }

  // Use robust normalizer on the entire text
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

