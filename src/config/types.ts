import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// User types
export const UserRoleSchema = z.enum(['donor', 'ngo', 'admin', 'pharmacist']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  geohash: z.string(),
  address: z.string().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

export const UserSchema = z.object({
  uid: z.string(),
  role: UserRoleSchema,
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  location: LocationSchema.optional(),
  organizationType: z.string().optional(), // For NGOs: charity, hospital, etc.
  registrationNumber: z.string().optional(), // For NGOs and Donors
  verified: z.boolean().default(false), // Admin verification status
  createdAt: z.instanceof(Timestamp),
});
export type User = z.infer<typeof UserSchema>;

// Donation types
export const DonationStatusSchema = z.enum(['available', 'matched', 'confirmed', 'in_transit', 'delivered', 'cancelled']);
export type DonationStatus = z.infer<typeof DonationStatusSchema>;

export const DonationSchema = z.object({
  id: z.string(),
  name: z.string(),
  batchNo: z.string(),
  manufacturer: z.string(),
  expiryDate: z.instanceof(Timestamp),
  mfgDate: z.string().optional(), // Manufacturing date in MM/YYYY format
  mrp: z.number().optional(), // Maximum Retail Price
  quantity: z.number(),
  photos: z.array(z.string()),
  frontPhoto: z.string().optional(), // Front image showing medicine name & brand
  expiryLabelPhoto: z.string().optional(), // Label image showing batch, MFG, EXP, MRP
  donorId: z.string(),
  donorName: z.string(),
  donorType: z.string().optional(), // company, pharmacy, individual
  geo: LocationSchema,
  createdAt: z.instanceof(Timestamp),
  status: DonationStatusSchema,
  description: z.string().optional(),
  matchedNgoId: z.string().optional(),
  matchedNgoName: z.string().optional(),
  matchScore: z.number().optional(), // AI matching score
  urgency: z.enum(['low', 'medium', 'high']).optional(),
});
export type Donation = z.infer<typeof DonationSchema>;

// NGO Request types
export const RequestStatusSchema = z.enum(['open', 'matched', 'confirmed', 'fulfilled', 'cancelled']);
export type RequestStatus = z.infer<typeof RequestStatusSchema>;

export const MedicineRequestSchema = z.object({
  id: z.string(),
  ngoId: z.string(),
  ngoName: z.string(),
  medicineName: z.string(),
  quantity: z.number(),
  urgency: z.enum(['low', 'medium', 'high']),
  reason: z.string(),
  geo: LocationSchema,
  status: RequestStatusSchema,
  matchedDonationId: z.string().optional(),
  createdAt: z.instanceof(Timestamp),
  expiresAt: z.instanceof(Timestamp).optional(),
});
export type MedicineRequest = z.infer<typeof MedicineRequestSchema>;

// Match types
export const MatchStatusSchema = z.enum(['pending', 'donor_confirmed', 'ngo_confirmed', 'both_confirmed', 'rejected']);
export type MatchStatus = z.infer<typeof MatchStatusSchema>;

export const DonationMatchSchema = z.object({
  id: z.string(),
  donationId: z.string(),
  requestId: z.string(),
  donorId: z.string(),
  ngoId: z.string(),
  matchScore: z.number(),
  distance: z.number(), // in km
  status: MatchStatusSchema,
  donorConfirmed: z.boolean().default(false),
  ngoConfirmed: z.boolean().default(false),
  createdAt: z.instanceof(Timestamp),
  confirmedAt: z.instanceof(Timestamp).optional(),
});
export type DonationMatch = z.infer<typeof DonationMatchSchema>;

// OCR types
export const ParsedFieldsSchema = z.object({
  name: z.string().optional(),
  batchNo: z.string().optional(),
  manufacturer: z.string().optional(),
  expiryDate: z.string().optional(),
  mrp: z.number().optional(),
  mfdDate: z.string().optional(),
});
export type ParsedFields = z.infer<typeof ParsedFieldsSchema>;

// Price advice types
export const PriceAdviceSchema = z.object({
  discountPct: z.number(),
  suggestedPrice: z.number(),
  daysToExpiry: z.number(),
  tier: z.string(),
});
export type PriceAdvice = z.infer<typeof PriceAdviceSchema>;

// Form schemas
export const DonationUploadFormSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  batchNo: z.string().min(1, 'Batch number is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  description: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  declaration: z.boolean().refine(val => val === true, 'You must confirm the declaration'),
});
export type DonationUploadForm = z.infer<typeof DonationUploadFormSchema>;

export const RequestFormSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  urgency: z.enum(['low', 'medium', 'high']),
  reason: z.string().min(10, 'Please provide a detailed reason'),
});
export type RequestForm = z.infer<typeof RequestFormSchema>;

export const MedicineUploadFormSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  batchNo: z.string().min(1, 'Batch number is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  mrp: z.number().min(0, 'MRP must be positive'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  declaration: z.boolean().refine(val => val === true, 'You must confirm the declaration'),
});
export type MedicineUploadForm = z.infer<typeof MedicineUploadFormSchema>;

export const LoginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

export const SignupFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: UserRoleSchema,
  phone: z.string().optional(),
  organizationType: z.string().optional(),
  registrationNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export type SignupForm = z.infer<typeof SignupFormSchema>;

// Ved AI types
export const VedAIResponseSchema = z.object({
  question: z.string(),
  // Generic answer field for simple QA responses
  answer: z.string().optional(),
  // Context classification (optional)
  context: z.enum(['donation', 'request', 'general', 'medicine_info']).optional(),
  // Suggestions for follow-up questions (optional)
  suggestions: z.array(z.string()).optional(),
  // Extended fields for medicine information (Zapier webhook payload)
  dosage: z.string().optional(),
  contraindications: z.array(z.string()).optional(),
  sideEffects: z.array(z.string()).optional(),
  precautions: z.array(z.string()).optional(),
  generalAdvice: z.string().optional(),
});
export type VedAIResponse = z.infer<typeof VedAIResponseSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.instanceof(Timestamp),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Donate: undefined;
  Request: undefined;
  Matches: undefined;
  Admin: undefined;
  Profile: undefined;
  MyDonations: undefined;
  MyRequests: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  DonationDetails: { donationId: string };
  RequestDetails: { requestId: string };
  MatchDetails: { matchId: string };
  Location: undefined;
  VedAI: undefined;
  Connection: { matchId: string };
  MedicineDetails: { medicineId: string };
};

// Medicine types
export const MedicineSchema = z.object({
  id: z.string(),
  name: z.string(),
  batchNo: z.string(),
  manufacturer: z.string(),
  expiryDate: z.instanceof(Timestamp),
  mrp: z.number(),
  price: z.number(),
  quantity: z.number(),
  pharmacyId: z.string(),
  pharmacyName: z.string(),
  geo: LocationSchema,
  status: z.enum(['active', 'paused', 'soldout']),
  description: z.string(),
  photos: z.array(z.string()),
  frontPhoto: z.string().optional(),
  expiryLabelPhoto: z.string().optional(),
  createdAt: z.instanceof(Timestamp),
});
export type Medicine = z.infer<typeof MedicineSchema>;

// Cart types
export const CartItemSchema = z.object({
  medicineId: z.string(),
  name: z.string(),
  price: z.number(),
  qty: z.number(),
  pharmacyId: z.string(),
  pharmacyName: z.string(),
  manufacturer: z.string(),
  photo: z.string().optional(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  updatedAt: z.instanceof(Timestamp),
});
export type Cart = z.infer<typeof CartSchema>;

