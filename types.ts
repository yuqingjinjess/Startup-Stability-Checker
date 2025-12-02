export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export enum Verdict {
  StrongBuy = 'Strong Buy',
  ReasonableBet = 'Reasonable Bet',
  Caution = 'Caution'
}

export enum StatusColor {
  Green = 'Green',
  Yellow = 'Yellow',
  Red = 'Red'
}

export interface RevenuePoint {
  year: string;
  revenue: number;
}

export interface UserBasePoint {
  year: string;
  users: number;
}

export interface SocialLink {
  platform: string;
  uri: string;
}

export interface FounderContent {
  title: string;
  uri: string;
  source: string;
}

export interface Pillar {
  id: number;
  title: string;
  weight: string;
  status: StatusColor;
  summary: string; // The text to show in the summary line
  details: Record<string, string>; // Key-value pairs for the bullet points
  revenueData?: RevenuePoint[];
  userBaseData?: UserBasePoint[];
  founderSocials?: SocialLink[];
  founderContent?: FounderContent[];
}

export interface CareerImpact {
  learning: 'High' | 'Med' | 'Low';
  brand: 'High' | 'Med' | 'Low';
  wlb: 'High' | 'Med' | 'Low';
  jobSecurity: 'High' | 'Med' | 'Low';
  compUpside: 'High' | 'Med' | 'Low';
  visaSafety: 'High' | 'Med' | 'Low';
}

export interface CompanyProfile {
  name: string;
  founded: string;
  location: string;
  product: string;
  useCase: string;
  lastFunding: string;
}

export interface RecommendedRead {
  title: string;
  uri: string;
  source: string;
  summary: string;
}

export interface SafetyReport {
  companyProfile: CompanyProfile;
  stabilityScore: {
    score: number;
    riskLevel: RiskLevel;
    verdict: Verdict;
  };
  careerImpact: CareerImpact;
  summary: {
    upside: string;
    redFlags: string;
    unknowns: string;
    guardianTake: string;
  };
  recommendedReads: RecommendedRead[];
  pillars: Pillar[];
  transparency: {
    penalty: number;
    missingData: string[];
  };
  visaSafety: {
    h1bSponsor: string;
    greenCard: string;
    eVerify: string;
  };
  sources: { title: string; uri: string }[];
}

// Battle Mode Types
export interface ComparisonRow {
  feature: string;
  companyValues: Record<string, string>; // { "Stripe": "Data", "Uber": "Data" }
  winner: string; // The name of the winning company or "Tie"
}

export interface ComparisonReport {
  companies: string[];
  rows: ComparisonRow[];
  guardianVerdict: string;
  sources: { title: string; uri: string }[];
}

// For ambiguity handling
export interface AmbiguityResponse {
  isAmbiguous: boolean;
  options?: string[];
  originalQuery: string;
}

export type ApiResponse = 
  | { mode: 'single'; data: SafetyReport }
  | { mode: 'battle'; data: ComparisonReport }
  | { mode: 'ambiguous'; data: AmbiguityResponse };

export type AppState = 'idle' | 'loading' | 'success' | 'ambiguous' | 'error';