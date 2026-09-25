export interface ChainRecord {
  year: number;
  recordType: string;
  details: string;
  docNumber?: string;
}

export interface ExtractedFieldItem {
  field: string;
  value: string;
  confidence: number;
  status: 'Valid' | 'Needs review';
}

export interface Parcel {
  id: string; // Khasra number (e.g. "88/1")
  owner: string;
  ownerH: string;
  village: string;
  tehsil: string;
  district: string;
  rec: number; // Record area in acres
  gis: number; // GIS area in acres
  cls: string; // Land classification in record
  gcls: string; // Land classification in GIS
  clsOk: boolean;
  conf: number; // OCR overall confidence %
  note?: string;
  chain: [number, string, string][]; // [year, title, description]
  polygon: string; // SVG coordinates
  labelPos: [number, number];
  status?: 'Clean' | 'Review' | 'Verified' | 'Rejected';
  decisionRemarks?: string;
  decisionAt?: string;
  decisionBy?: string;
  extractedFields: ExtractedFieldItem[];
}

export interface AuditBlock {
  index: number;
  t: string;
  isoDate: string;
  action: string;
  msg: string;
  origMsg: string;
  khasraId?: string;
  officer: string;
  prev: string;
  h: string;
  isTampered?: boolean;
}

export interface AuditVerificationResult {
  intact: boolean;
  totalBlocks: number;
  invalidBlockIndex?: number;
  details: string;
  verifiedAt: string;
}

export interface SystemStats {
  recordsDigitized: number;
  crossVerified: number;
  discrepancies: number;
  awaitingOfficer: number;
  coveragePercent: number;
  cleanPercent: number;
  pipelineStages: {
    ocrRecords: number;
    confidenceCheck: number;
    gisMatching: number;
    recordValidation: number;
  };
}

export interface DiscrepancyAnalysis {
  khasraId: string;
  areaDiffPercent: number;
  reasons: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  legalContext: string;
  recommendedAction: string;
  statutoryReference?: string;
}
