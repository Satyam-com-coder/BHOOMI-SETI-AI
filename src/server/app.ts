import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { db } from './db.ts';
import { analyzeLandDocument, explainDiscrepancy } from './gemini.ts';

dotenv.config();

export const app = express();

// Parse json with large limit to accept scanned document base64 uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Get system statistics
app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const tolerance = req.query.tolerance ? Number(req.query.tolerance) : 5;
    const stats = db.getStats(tolerance);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get stats' });
  }
});

// 2. Get all cadastral parcels
app.get('/api/parcels', (req: Request, res: Response) => {
  try {
    const tolerance = req.query.tolerance ? Number(req.query.tolerance) : 5;
    const parcels = db.getParcels(tolerance);
    res.json(parcels);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get parcels' });
  }
});

// 3. Get single parcel by ID
app.get('/api/parcels/:id', (req: Request, res: Response) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const tolerance = req.query.tolerance ? Number(req.query.tolerance) : 5;
    const parcel = db.getParcel(id, tolerance);
    if (!parcel) {
      return res.status(404).json({ error: `Khasra ${id} not found` });
    }
    res.json(parcel);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get parcel' });
  }
});

// 4. Update an extracted field (correction by officer)
app.put('/api/parcels/:id/field', async (req: Request, res: Response) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const { fieldName, newValue, officer } = req.body;
    if (!fieldName || newValue === undefined) {
      return res.status(400).json({ error: 'fieldName and newValue are required' });
    }
    const updated = await db.updateParcelField(id, fieldName, String(newValue), officer || 'Revenue Officer');
    if (!updated) {
      return res.status(404).json({ error: `Khasra ${id} not found` });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update field' });
  }
});

// 5. Submit verification decision (Verify / Reject / Reopen)
app.put('/api/parcels/:id/decision', async (req: Request, res: Response) => {
  try {
    const id = decodeURIComponent(req.params.id);
    const { decision, remarks, officer } = req.body;
    if (!decision || !['Verified', 'Rejected', 'Pending'].includes(decision)) {
      return res.status(400).json({ error: 'Valid decision (Verified | Rejected | Pending) is required' });
    }
    const updated = await db.recordDecision(
      id,
      decision,
      remarks || '',
      officer || 'Revenue Officer (Tehsil Kharsia)'
    );
    if (!updated) {
      return res.status(404).json({ error: `Khasra ${id} not found` });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record decision' });
  }
});

// 6. Real AI Multilingual OCR Analysis
app.post('/api/ocr/analyze', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, documentHint } = req.body;
    const result = await analyzeLandDocument(imageBase64, mimeType, documentHint);

    // Record audit entry
    await db.logAudit(
      'OCR_DOCUMENT_PROCESSED',
      `Multilingual OCR & Field extraction completed for Khasra ${result.khasraId} (${result.village})`,
      result.khasraId,
      'Bhoomi-Setu AI Engine'
    );

    res.json(result);
  } catch (err: any) {
    console.error('OCR API Error:', err);
    res.status(500).json({ error: err.message || 'OCR processing failed' });
  }
});

// 7. AI Discrepancy & Legal Advisory Explanation
app.post('/api/ai/explain-discrepancy', async (req: Request, res: Response) => {
  try {
    const parcelData = req.body;
    const advisory = await explainDiscrepancy(parcelData);
    res.json(advisory);
  } catch (err: any) {
    console.error('AI Explanation Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate advisory' });
  }
});

// 8. Cryptographic Audit Trail
app.get('/api/audit', (req: Request, res: Response) => {
  try {
    const trail = db.getAuditTrail();
    res.json(trail);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get audit trail' });
  }
});

// 9. Verify hash chain integrity
app.post('/api/audit/verify', (req: Request, res: Response) => {
  try {
    const verification = db.verifyAuditChain();
    res.json(verification);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to verify audit chain' });
  }
});

// 10. Tamper simulation for interactive security demonstration
app.post('/api/audit/tamper', (req: Request, res: Response) => {
  try {
    const targetIndex = req.body.index !== undefined ? Number(req.body.index) : 1;
    const result = db.tamperAuditBlock(targetIndex);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Tamper simulation failed' });
  }
});

// 11. Reset database to initial state
app.post('/api/audit/reset', (req: Request, res: Response) => {
  try {
    db.reset();
    res.json({ success: true, message: 'Database and ledger reset to initial clean state.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Reset failed' });
  }
});

// 12. Export audit trail
app.get('/api/audit/export', (req: Request, res: Response) => {
  try {
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    const trail = db.getAuditTrail();

    if (format === 'csv') {
      const headers = ['Index', 'Time', 'Action', 'Khasra', 'Officer', 'Message', 'Previous_Hash', 'Block_SHA256'];
      const rows = trail.map(b => [
        b.index,
        `"${b.t}"`,
        `"${b.action}"`,
        `"${b.khasraId || ''}"`,
        `"${b.officer}"`,
        `"${b.msg.replace(/"/g, '""')}"`,
        `"${b.prev}"`,
        `"${b.h}"`
      ].join(','));
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="bhoomi-setu-audit-ledger.csv"');
      return res.send([headers.join(','), ...rows].join('\n'));
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="bhoomi-setu-audit-ledger.json"');
    res.send(JSON.stringify(trail, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Export failed' });
  }
});
