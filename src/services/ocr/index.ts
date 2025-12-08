import { ParsedFields } from '../../config/types';
import { mockParse } from './mock';
import { mlkitParse } from './mlkit';
import Constants from 'expo-constants';

export class OcrService {
  static async parse(imageUri: string): Promise<ParsedFields> {
    // Check if running in Expo Go
    const isExpoGo = (Constants as any).executionEnvironment === 'storeClient';

    if (isExpoGo) {
      console.log('📱 Running in Expo Go: Using Mock OCR');
      return mockParse(imageUri);
    }

    // Use ML Kit parser for native builds
    console.log('📱 Running in Native Build: Using ML Kit OCR');
    return mlkitParse(imageUri);
  }

  static async parseExpiryLabel(imageUri: string): Promise<ParsedFields> {
    // Extract all fields from expiry label photo (MRP, Batch No, Mfd date, Exp date)
    const result = await mlkitParse(imageUri);
    return {
      batchNo: result.batchNo,
      expiryDate: result.expiryDate,
      mrp: result.mrp,
      mfdDate: result.mfdDate,
    };
  }
}

export { mockParse, mlkitParse };

// Convenience function for extracting medicine info
export const extractMedicineInfo = async (imageUri: string): Promise<ParsedFields> => {
  return OcrService.parse(imageUri);
};
