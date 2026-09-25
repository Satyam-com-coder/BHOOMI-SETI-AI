import crypto from 'node:crypto';
import type { Parcel, AuditBlock, AuditVerificationResult, SystemStats } from '../types/index.ts';

// Initial parcel database matching the prototype data plus extra detail
const INITIAL_PARCELS: Parcel[] = [
  {
    id: '88/1',
    owner: 'Ramesh Kumar Sahu',
    ownerH: 'रमेश कुमार साहू',
    village: 'Bhatapara',
    tehsil: 'Kharsia',
    district: 'Raigarh',
    rec: 2.0,
    gis: 1.52,
    cls: 'Irrigated agricultural',
    gcls: 'Vegetation',
    clsOk: false,
    conf: 62,
    chain: [
      [1995, 'Khatauni record (B-1)', 'Ramesh Kumar Sahu · 2.00 acre · Khasra 88/1 (Ancestral khata)'],
      [2005, 'Mutation record (Panji)', 'Ownership transition recorded under Tehsil Order No. 41/2005'],
      [2015, 'Registration record', 'Registry linked to parcel 88/1 · Sub-Registrar Kharsia'],
      [2024, 'Current computerized land record', 'Owner and land use linked · Bhuiyan Portal Sync']
    ],
    polygon: '40,50 250,40 270,170 60,190',
    labelPos: [135, 118],
    extractedFields: [
      { field: 'Owner name', value: 'Ramesh Kumar Sahu (रमेश कुमार साहू)', confidence: 96, status: 'Valid' },
      { field: 'Khasra number', value: '88/1', confidence: 91, status: 'Valid' },
      { field: 'Area', value: '2.00 acre', confidence: 62, status: 'Needs review' },
      { field: 'Village / Tehsil', value: 'Bhatapara / Kharsia', confidence: 98, status: 'Valid' },
      { field: 'Land classification', value: 'Irrigated agricultural', confidence: 54, status: 'Needs review' }
    ]
  },
  {
    id: '88/2',
    owner: 'Suresh Kumar',
    ownerH: 'सुरेश कुमार',
    village: 'Bhatapara',
    tehsil: 'Kharsia',
    district: 'Raigarh',
    rec: 1.8,
    gis: 1.79,
    cls: 'Agricultural',
    gcls: 'Agricultural',
    clsOk: true,
    conf: 94,
    chain: [
      [1998, 'Khatauni record (B-1)', 'Suresh Kumar · 1.80 acre · Regular settlement'],
      [2010, 'Registration record', 'Registry linked · Sub-Registrar Kharsia'],
      [2024, 'Current computerized record', 'Verified · Geo-referenced cadastral map']
    ],
    polygon: '250,40 470,55 480,190 270,170',
    labelPos: [365, 115],
    extractedFields: [
      { field: 'Owner name', value: 'Suresh Kumar (सुरेश कुमार)', confidence: 98, status: 'Valid' },
      { field: 'Khasra number', value: '88/2', confidence: 96, status: 'Valid' },
      { field: 'Area', value: '1.80 acre', confidence: 94, status: 'Valid' },
      { field: 'Village / Tehsil', value: 'Bhatapara / Kharsia', confidence: 99, status: 'Valid' },
      { field: 'Land classification', value: 'Agricultural', confidence: 93, status: 'Valid' }
    ]
  },
  {
    id: '89/1',
    owner: 'Mohan Lal',
    ownerH: 'मोहन लाल',
    village: 'Bhatapara',
    tehsil: 'Kharsia',
    district: 'Raigarh',
    rec: 3.1,
    gis: 3.08,
    cls: 'Agricultural',
    gcls: 'Agricultural',
    clsOk: true,
    conf: 92,
    chain: [
      [1992, 'Khatauni record (B-1)', 'Mohan Lal · 3.10 acre'],
      [2008, 'Mutation record', 'Succession mutation recorded with consent'],
      [2024, 'Current computerized record', 'Cadastral GIS polygon boundary verified']
    ],
    polygon: '60,190 270,170 290,330 50,340',
    labelPos: [160, 260],
    extractedFields: [
      { field: 'Owner name', value: 'Mohan Lal (मोहन लाल)', confidence: 97, status: 'Valid' },
      { field: 'Khasra number', value: '89/1', confidence: 95, status: 'Valid' },
      { field: 'Area', value: '3.10 acre', confidence: 92, status: 'Valid' },
      { field: 'Village / Tehsil', value: 'Bhatapara / Kharsia', confidence: 98, status: 'Valid' },
      { field: 'Land classification', value: 'Agricultural', confidence: 91, status: 'Valid' }
    ]
  },
  {
    id: '89/2',
    owner: 'Kamal Singh',
    ownerH: 'कमल सिंह',
    village: 'Bhatapara',
    tehsil: 'Kharsia',
    district: 'Raigarh',
    rec: 2.4,
    gis: 2.41,
    cls: 'Agricultural',
    gcls: 'Agricultural',
    clsOk: true,
    conf: 95,
    chain: [
      [2001, 'Khatauni record (B-1)', 'Kamal Singh · 2.40 acre'],
      [2012, 'Registration record', 'Sale deed deed registered · Sub-Registrar Kharsia'],
      [2024, 'Current computerized record', 'Verified · Boundaries aligned']
    ],
    polygon: '270,170 480,190 500,325 290,330',
    labelPos: [385, 255],
    extractedFields: [
      { field: 'Owner name', value: 'Kamal Singh (कमल सिंह)', confidence: 99, status: 'Valid' },
      { field: 'Khasra number', value: '89/2', confidence: 98, status: 'Valid' },
      { field: 'Area', value: '2.40 acre', confidence: 95, status: 'Valid' },
      { field: 'Village / Tehsil', value: 'Bhatapara / Kharsia', confidence: 99, status: 'Valid' },
      { field: 'Land classification', value: 'Agricultural', confidence: 96, status: 'Valid' }
    ]
  },
  {
    id: '112/3',
    owner: 'Anita Devi',
    ownerH: 'अनीता बाई (Anita Bai)',
    village: 'Raigarh',
    tehsil: 'Kharsia',
    district: 'Raigarh',
    rec: 1.2,
    gis: 1.12,
    cls: 'Agricultural',
    gcls: 'Agricultural',
    clsOk: true,
    conf: 58,
    note: 'Owner name differs across records: Anita Devi (Registry 2024) vs Anita Bai (Khatauni 1996)',
    chain: [
      [1996, 'Khatauni record (B-1)', 'Anita Bai · 1.20 acre'],
      [2009, 'Mutation record', 'Name entered as Anita Devi in revenue parcha'],
      [2024, 'Current computerized record', 'Awaiting alias reconciliation']
    ],
    polygon: '470,55 570,80 560,200 480,190',
    labelPos: [518, 135],
    extractedFields: [
      { field: 'Owner name', value: 'Anita Devi / Anita Bai', confidence: 58, status: 'Needs review' },
      { field: 'Khasra number', value: '112/3', confidence: 94, status: 'Valid' },
      { field: 'Area', value: '1.20 acre', confidence: 82, status: 'Valid' },
      { field: 'Village / Tehsil', value: 'Raigarh / Kharsia', confidence: 97, status: 'Valid' },
      { field: 'Land classification', value: 'Agricultural', confidence: 89, status: 'Valid' }
    ]
  },
  {
    id: '201/7',
    owner: 'Dinesh Patel',
    ownerH: 'दिनेश पटेल',
    village: 'Kharsia',
    tehsil: 'Kharsia',
    district: 'Raigarh',
    rec: 2.6,
    gis: 2.58,
    cls: 'Agricultural',
    gcls: 'Agricultural',
    clsOk: true,
    conf: 88,
    chain: [
      [2003, 'Khatauni record (B-1)', 'Dinesh Patel · 2.60 acre'],
      [2024, 'Current computerized record', 'Owner linked · Verified without dispute']
    ],
    polygon: '480,190 560,200 570,320 500,325',
    labelPos: [525, 262],
    extractedFields: [
      { field: 'Owner name', value: 'Dinesh Patel (दिनेश पटेल)', confidence: 94, status: 'Valid' },
      { field: 'Khasra number', value: '201/7', confidence: 96, status: 'Valid' },
      { field: 'Area', value: '2.60 acre', confidence: 88, status: 'Valid' },
      { field: 'Village / Tehsil', value: 'Kharsia / Kharsia', confidence: 98, status: 'Valid' },
      { field: 'Land classification', value: 'Agricultural', confidence: 92, status: 'Valid' }
    ]
  }
];

class Database {
  private parcels: Parcel[] = [];
  private auditTrail: AuditBlock[] = [];
  private defaultOfficer = 'Revenue Officer (RO-Raigarh-412)';

  constructor() {
    this.reset();
  }

  // SHA-256 calculation
  private computeHash(prevHash: string, timestamp: string, action: string, msg: string, officer: string): string {
    const raw = `${prevHash}|${timestamp}|${action}|${msg}|${officer}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  // Add block to hash chain
  public async logAudit(action: string, msg: string, khasraId?: string, officer?: string): Promise<AuditBlock> {
    const off = officer || this.defaultOfficer;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const isoDate = now.toISOString();

    const prevHash = this.auditTrail.length > 0
      ? this.auditTrail[this.auditTrail.length - 1].h
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const hash = this.computeHash(prevHash, timeStr, action, msg, off);

    const block: AuditBlock = {
      index: this.auditTrail.length + 1,
      t: timeStr,
      isoDate,
      action,
      msg,
      origMsg: msg,
      khasraId,
      officer: off,
      prev: prevHash,
      h: hash,
      isTampered: false
    };

    this.auditTrail.push(block);
    return block;
  }

  public getParcels(tolerance = 5): (Parcel & {
    areaDiffPercent: number;
    reasons: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
    effectiveStatus: 'Clean' | 'Review' | 'Verified' | 'Rejected';
  })[] {
    return this.parcels.map(p => {
      const areaDiffPercent = Math.abs(p.rec - p.gis) / p.rec * 100;
      const reasons: string[] = [];

      if (areaDiffPercent > tolerance) {
        reasons.push(`Area differs ${areaDiffPercent.toFixed(1)}% from GIS (${p.rec.toFixed(2)} vs ${p.gis.toFixed(2)} ac)`);
      }
      if (p.conf < 70) {
        reasons.push(`OCR confidence ${p.conf}% below threshold`);
      }
      if (p.chain.length < 3) {
        reasons.push('Ownership chain incomplete (< 3 historical records)');
      }
      if (p.note) {
        reasons.push(p.note);
      }
      if (!p.clsOk) {
        reasons.push(`Land classification mismatch: Record (${p.cls}) vs GIS (${p.gcls})`);
      }

      const riskLevel: 'Low' | 'Medium' | 'High' =
        areaDiffPercent > 25 || reasons.length >= 3 ? 'High' : reasons.length > 0 ? 'Medium' : 'Low';

      let effectiveStatus: 'Clean' | 'Review' | 'Verified' | 'Rejected' = 'Clean';
      if (p.status === 'Verified') {
        effectiveStatus = 'Verified';
      } else if (p.status === 'Rejected') {
        effectiveStatus = 'Rejected';
      } else if (reasons.length > 0) {
        effectiveStatus = 'Review';
      } else {
        effectiveStatus = 'Clean';
      }

      return {
        ...p,
        areaDiffPercent,
        reasons,
        riskLevel,
        effectiveStatus
      };
    });
  }

  public getParcel(id: string, tolerance = 5) {
    const parcels = this.getParcels(tolerance);
    return parcels.find(p => p.id === id) || null;
  }

  public async recordDecision(
    id: string,
    decision: 'Verified' | 'Rejected' | 'Pending',
    remarks: string,
    officer: string
  ): Promise<Parcel | null> {
    const parcel = this.parcels.find(p => p.id === id);
    if (!parcel) return null;

    if (decision === 'Pending') {
      delete parcel.status;
      delete parcel.decisionRemarks;
      delete parcel.decisionAt;
      delete parcel.decisionBy;
      await this.logAudit('REOPEN_RECORD', `Reopened for review — Khasra ${id}`, id, officer);
    } else {
      parcel.status = decision;
      parcel.decisionRemarks = remarks || (decision === 'Verified' ? 'Approved based on revenue documents' : 'Rejected due to discrepancy');
      parcel.decisionAt = new Date().toISOString();
      parcel.decisionBy = officer;
      await this.logAudit(
        `OFFICER_${decision.toUpperCase()}`,
        `${decision} — Khasra ${id} by ${officer}. Remarks: ${parcel.decisionRemarks}`,
        id,
        officer
      );
    }

    return parcel;
  }

  public async updateParcelField(
    id: string,
    fieldName: string,
    newValue: string,
    officer: string
  ): Promise<Parcel | null> {
    const parcel = this.parcels.find(p => p.id === id);
    if (!parcel) return null;

    let fieldUpdated = false;
    // Update in extracted fields
    const fIdx = parcel.extractedFields.findIndex(f => f.field.toLowerCase() === fieldName.toLowerCase());
    if (fIdx >= 0) {
      parcel.extractedFields[fIdx].value = newValue;
      parcel.extractedFields[fIdx].status = 'Valid';
      parcel.extractedFields[fIdx].confidence = 100;
      fieldUpdated = true;
    }

    // Also update main attributes if matching
    if (fieldName.toLowerCase().includes('area')) {
      const parsed = parseFloat(newValue);
      if (!isNaN(parsed) && parsed > 0) {
        parcel.rec = parsed;
        fieldUpdated = true;
      }
    } else if (fieldName.toLowerCase().includes('owner')) {
      parcel.owner = newValue;
      fieldUpdated = true;
    } else if (fieldName.toLowerCase().includes('classification')) {
      parcel.cls = newValue;
      fieldUpdated = true;
    }

    await this.logAudit(
      'FIELD_CORRECTION',
      `Officer corrected "${fieldName}" to "${newValue}" for Khasra ${id}`,
      id,
      officer
    );

    return parcel;
  }

  public async addParcel(newParcel: Parcel, officer: string): Promise<Parcel> {
    const existingIdx = this.parcels.findIndex(p => p.id === newParcel.id);
    if (existingIdx >= 0) {
      this.parcels[existingIdx] = newParcel;
    } else {
      this.parcels.push(newParcel);
    }
    await this.logAudit(
      'NEW_PARCEL_INGESTED',
      `Ingested digitized record for Khasra ${newParcel.id} (${newParcel.village})`,
      newParcel.id,
      officer
    );
    return newParcel;
  }

  public getAuditTrail(): AuditBlock[] {
    return [...this.auditTrail];
  }

  // Cryptographic integrity validation of entire blockchain
  public verifyAuditChain(): AuditVerificationResult {
    let invalidIndex: number | undefined;

    for (let i = 0; i < this.auditTrail.length; i++) {
      const block = this.auditTrail[i];
      const expectedPrev = i === 0
        ? '0000000000000000000000000000000000000000000000000000000000000000'
        : this.auditTrail[i - 1].h;

      if (block.prev !== expectedPrev) {
        invalidIndex = i;
        break;
      }

      const recomputedHash = this.computeHash(
        block.prev,
        block.t,
        block.action,
        block.msg,
        block.officer
      );

      if (recomputedHash !== block.h) {
        invalidIndex = i;
        break;
      }
    }

    const intact = invalidIndex === undefined;
    return {
      intact,
      totalBlocks: this.auditTrail.length,
      invalidBlockIndex: invalidIndex,
      details: intact
        ? `All ${this.auditTrail.length} cryptographic entries verified. SHA-256 chain is strictly intact.`
        : `Hash mismatch at Block #${(invalidIndex || 0) + 1}. Cryptographic verification failed! Ledger integrity was compromised.`,
      verifiedAt: new Date().toISOString()
    };
  }

  // Simulate tampering in Block 2 or specified block
  public tamperAuditBlock(targetIndex = 1): { success: boolean; isTampered: boolean; message: string } {
    if (this.auditTrail.length <= targetIndex) {
      return { success: false, isTampered: false, message: 'Not enough blocks to simulate tampering' };
    }

    const block = this.auditTrail[targetIndex];
    if (block.isTampered) {
      // Revert tamper
      block.msg = block.origMsg;
      block.isTampered = false;
      return { success: true, isTampered: false, message: `Block #${targetIndex + 1} restored to authentic state.` };
    } else {
      // Apply tamper
      block.msg = `${block.origMsg} [TAMPERED: Land area manually altered without authorization]`;
      block.isTampered = true;
      return {
        success: true,
        isTampered: true,
        message: `Block #${targetIndex + 1} tampered! Any subsequent verify will detect hash corruption.`
      };
    }
  }

  public getStats(tolerance = 5): SystemStats {
    const list = this.getParcels(tolerance);
    const verifiedCount = list.filter(p => p.effectiveStatus === 'Verified').length;
    const awaitingOfficerCount = list.filter(p => p.effectiveStatus === 'Review').length;
    const discrepanciesCount = list.filter(p => p.reasons.length > 0).length;

    const baseDigitized = 18420;
    const baseVerified = 15930 + verifiedCount;

    return {
      recordsDigitized: baseDigitized,
      crossVerified: baseVerified,
      discrepancies: 1145 + (discrepanciesCount > 0 ? discrepanciesCount - 2 : 0),
      awaitingOfficer: awaitingOfficerCount,
      coveragePercent: 84.5,
      cleanPercent: 86.8,
      pipelineStages: {
        ocrRecords: baseDigitized,
        confidenceCheck: 17105,
        gisMatching: 16540,
        recordValidation: baseVerified
      }
    };
  }

  public reset() {
    this.parcels = JSON.parse(JSON.stringify(INITIAL_PARCELS));
    this.auditTrail = [];

    // Seed genesis and initial logs
    const seed = [
      { action: 'OCR_COMPLETED', msg: 'Multilingual OCR extraction completed for Khasra 88/1 (Bhatapara)', id: '88/1' },
      { action: 'CHAIN_CREATED', msg: 'Historical ownership chain linked across Khatauni 1995 to current 2024 record', id: '88/1' },
      { action: 'GIS_MISMATCH_FLAGGED', msg: 'GIS discrepancy detected: Khasra 88/1 (Record: 2.00 ac vs GIS: 1.52 ac, 24% gap)', id: '88/1' },
      { action: 'SYSTEM_AUDIT_START', msg: 'Bhoomi-Setu cadastral ledger initialized for Tehsil Kharsia, Dist Raigarh', id: undefined }
    ];

    for (const item of seed) {
      const prevHash = this.auditTrail.length > 0
        ? this.auditTrail[this.auditTrail.length - 1].h
        : '0000000000000000000000000000000000000000000000000000000000000000';

      const timeStr = new Date(Date.now() - (seed.length - this.auditTrail.length) * 60000).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const hash = this.computeHash(prevHash, timeStr, item.action, item.msg, this.defaultOfficer);

      this.auditTrail.push({
        index: this.auditTrail.length + 1,
        t: timeStr,
        isoDate: new Date().toISOString(),
        action: item.action,
        msg: item.msg,
        origMsg: item.msg,
        khasraId: item.id,
        officer: this.defaultOfficer,
        prev: prevHash,
        h: hash,
        isTampered: false
      });
    }
  }
}

export const db = new Database();
