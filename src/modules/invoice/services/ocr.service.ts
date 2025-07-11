import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OpenAI } from 'openai';
import * as sharp from 'sharp';
import { ProcessInvoiceImageDto, Language, OcrEngine } from '../dto/process-image.dto';
import { CreateInvoiceDto, InvoiceType } from '../dto/create-invoice.dto';
import { InvoiceStatus } from '../entities/invoice.entity';
import { formatCuit, validateCuit } from '../../../common/utils/cuit-validator';

interface ExtractedInvoiceData {
  supplierName?: string;
  supplierCuit?: string;
  amount: number;
  amount_105: number;
  total_neto: number;
  vat_amount_21: number;
  vat_amount_105: number;
  has_ii_bb?: boolean;
  ii_bb_amount?: number;
  total_amount: number;
  date: string;
  invoiceType: 'A' | 'X';
  confidence: number;
}

interface OcrResult {
  invoiceData: any;
  confidence: number;
  extractedText: string;
  supplierInfo?: {
    name: string;
    cuit?: string;
  };
  requiresSupplierSelection: boolean;
  metadata?: {
    language: string;
    engine: string;
    temperature: number;
    processingTime: number;
  };
  iibb_detected_terms?: string[];
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processInvoiceImage(
    imageBuffer: Buffer,
    options: ProcessInvoiceImageDto,
  ): Promise<OcrResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Iniciando procesamiento OCR con motor: ${options.ocrEngine}`);
      
      if (options.ocrEngine === OcrEngine.MOCK) {
        return this.generateMockResult(options, startTime);
      }

      // Optimizar imagen
      const optimizedBuffer = await this.optimizeImage(imageBuffer);
      const base64Image = optimizedBuffer.toString('base64');

      // Configurar prompt según idioma
      const prompt = this.buildPrompt(options.language || Language.SPA);

      // Llamada a OpenAI con parámetros configurables
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: options.temperature,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
      });

      const extractedText = response.choices[0]?.message?.content || '';
      const processingTime = Date.now() - startTime;

      this.logger.log(`OCR completado en ${processingTime}ms con temperatura ${options.temperature}`);

      return this.parseOcrResponse(extractedText, options, processingTime);

    } catch (error) {
      this.logger.error(`Error procesando imagen: ${error.message}`);
      throw new BadRequestException(`Error procesando la imagen: ${error.message}`);
    }
  }

  private buildPrompt(language: Language): string {
    const prompts = {
      [Language.SPA]: `
Analiza esta imagen de factura argentina y extrae la siguiente información en formato JSON:

{
  "supplierName": "nombre completo del proveedor",
  "supplierCuit": "CUIT en formato XX-XXXXXXXX-X",
  "amount": número (monto sin IVA),
  "amount_105": número (monto IVA 10.5%),
  "total_neto": número (total neto),
  "vat_amount_21": número (monto IVA 21%),
  "vat_amount_105": número (monto IVA 10.5%),
  "has_ii_bb": true/false (si aparece "Ingresos Brutos", "IIBB", "II.BB", "Percepciones", "Perc." o similar),
  "ii_bb_amount": número (monto exacto de Ingresos Brutos/IIBB/Percepciones si aparece, 0 si no),
  "total_amount": número (monto total final),
  "date": "YYYY-MM-DD",
  "invoiceType": "A" o "X",
  "confidence": número del 0 al 100
}

Importante:
- Todos los montos deben ser números exactos (sin símbolos)
- El CUIT debe tener formato XX-XXXXXXXX-X
- La fecha debe estar en formato YYYY-MM-DD
- has_ii_bb = true si ves cualquiera de estos términos:
  * "Ingresos Brutos" o "Ing. Brutos"
  * "IIBB" o "II.BB" o "I.I.B.B"
  * "Percepciones" o "Perc." o "Percep."
  * "Retenciones IIBB"
  * "Imp. Ingresos Brutos"
- ii_bb_amount debe ser el monto exacto que aparece junto a estos términos
- Solo responde con el JSON válido`,

      [Language.ENG]: `
Analyze this Argentine invoice image and extract the following information in JSON format:

{
  "supplierName": "complete supplier name",
  "supplierCuit": "CUIT in format XX-XXXXXXXX-X",
  "amount": number (amount without VAT),
  "amount_105": number (VAT 10.5% amount),
  "total_neto": number (net total),
  "vat_amount_21": number (VAT 21% amount),
  "vat_amount_105": number (VAT 10.5% amount),
  "has_ii_bb": true/false (if "Ingresos Brutos", "IIBB", "Percepciones", "Perceptions" or similar appears),
  "ii_bb_amount": number (exact amount of Ingresos Brutos/IIBB/Perceptions if present, 0 if not),
  "total_amount": number (final total amount),
  "date": "YYYY-MM-DD",
  "invoiceType": "A" or "X",
  "confidence": number from 0 to 100
}

Important:
- All amounts must be exact numbers (no symbols)
- CUIT must be in format XX-XXXXXXXX-X
- Date must be in YYYY-MM-DD format
- has_ii_bb = true if you see any of these terms:
  * "Ingresos Brutos" or "Gross Income"
  * "IIBB" or "II.BB"
  * "Percepciones" or "Perceptions"
  * "Retenciones IIBB"
- ii_bb_amount must be the exact amount appearing next to these terms
- Only respond with valid JSON`,

      [Language.POR]: `
Analise esta imagem de fatura argentina e extraia as seguintes informações em formato JSON:

{
  "supplierName": "nome completo do fornecedor",
  "supplierCuit": "CUIT no formato XX-XXXXXXXX-X",
  "amount": número (valor sem IVA),
  "amount_105": número (valor IVA 10.5%),
  "total_neto": número (total líquido),
  "vat_amount_21": número (valor IVA 21%),
  "vat_amount_105": número (valor IVA 10.5%),
  "has_ii_bb": true/false (se aparecer "Ingresos Brutos", "IIBB", "Percepciones" ou similar),
  "ii_bb_amount": número (valor exato de Ingresos Brutos/IIBB/Percepciones se presente, 0 se não),
  "total_amount": número (valor total final),
  "date": "YYYY-MM-DD",
  "invoiceType": "A" ou "X",
  "confidence": número de 0 a 100
}

Importante:
- Todos os valores devem ser números exatos (sem símbolos)
- O CUIT deve ter formato XX-XXXXXXXX-X
- A data deve estar no formato YYYY-MM-DD
- has_ii_bb = true se você ver qualquer um destes termos:
  * "Ingresos Brutos"
  * "IIBB" ou "II.BB"
  * "Percepciones" ou "Percepções"
  * "Retenciones IIBB"
- ii_bb_amount deve ser o valor exato que aparece junto a estes termos
- Responda apenas com JSON válido`
    };

    return prompts[language] || prompts[Language.SPA];
  }

  private detectIIBBTerms(extractedText: string): string[] {
    const iibbTerms = [
      'ingresos brutos',
      'ing. brutos',
      'iibb',
      'ii.bb',
      'i.i.b.b',
      'percepciones',
      'perc.',
      'percep.',
      'retenciones iibb',
      'imp. ingresos brutos'
    ];

    const detectedTerms: string[] = [];
    const textLower = extractedText.toLowerCase();

    iibbTerms.forEach(term => {
      if (textLower.includes(term)) {
        detectedTerms.push(term);
      }
    });

    return detectedTerms;
  }

  private generateMockResult(options: ProcessInvoiceImageDto, startTime: number): OcrResult {
    const processingTime = Date.now() - startTime;
    const totalNeto = 10000;
    const hasIIBB = true;
    const iibbAmount = totalNeto * 0.045; // 4.5% de IIBB típico
    
    const mockText = 'DEMO: Factura simulada con Percepciones de Ingresos Brutos (IIBB)';
    const detectedTerms = this.detectIIBBTerms(mockText);
    
    return {
      invoiceData: {
        amount: totalNeto,
        amount_105: 1050,
        total_neto: totalNeto,
        vat_amount_21: 2100,
        vat_amount_105: 1050,
        has_ii_bb: hasIIBB,
        ii_bb_amount: iibbAmount,
        total_amount: 13150 + iibbAmount,
        date: '2024-01-15',
        type: InvoiceType.A,
        status: InvoiceStatus.TO_PAY,
        supplierId: options.supplierId,
      },
      confidence: (options.confidenceThreshold || 95) + 5,
      extractedText: mockText,
      supplierInfo: {
        name: 'Proveedor Test DEMO',
        cuit: '20-12345678-9',
      },
      requiresSupplierSelection: !options.supplierId,
      metadata: {
        language: options.language || Language.SPA,
        engine: options.ocrEngine || OcrEngine.MOCK,
        temperature: options.temperature || 0.1,
        processingTime,
      },
      iibb_detected_terms: detectedTerms,
    };
  }

  private async parseOcrResponse(
    extractedText: string,
    options: ProcessInvoiceImageDto,
    processingTime: number,
  ): Promise<OcrResult> {
    try {
      const jsonMatch = extractedText.match(/```json\n([\s\S]*?)\n```/) || 
                       extractedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No se pudo extraer JSON de la respuesta');
      }

      const jsonData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      const extractedData: ExtractedInvoiceData = jsonData;

      if (extractedData.confidence < (options.confidenceThreshold || 95)) {
        throw new Error(
          `Confianza insuficiente: ${extractedData.confidence}% < ${options.confidenceThreshold || 95}%`
        );
      }

      // Detectar términos IIBB en el texto extraído
      const detectedTerms = this.detectIIBBTerms(extractedText);
      const hasIIBBFromText = detectedTerms.length > 0;
      
      // Usar la detección del JSON o del texto
      const hasIIBB = extractedData.has_ii_bb || hasIIBBFromText;
      
      // Usar el monto extraído por la IA o 0 como fallback
      const iibbAmount = extractedData.ii_bb_amount || 0;

      // Validar y formatear CUIT
      const supplierInfo = {
        name: extractedData.supplierName || '',
        cuit: this.formatAndValidateCuit(extractedData.supplierCuit || ''),
      };

      this.logger.log(`IIBB/Percepciones detectado: ${hasIIBB ? 'Sí' : 'No'} - Monto: $${iibbAmount} - Términos: [${detectedTerms.join(', ')}]`);

      return {
        invoiceData: {
          amount: extractedData.amount,
          amount_105: extractedData.amount_105,
          total_neto: extractedData.total_neto,
          vat_amount_21: extractedData.vat_amount_21,
          vat_amount_105: extractedData.vat_amount_105,
          has_ii_bb: hasIIBB,
          ii_bb_amount: iibbAmount,
          total_amount: extractedData.total_amount,
          date: extractedData.date,
          type: extractedData.invoiceType,
          status: InvoiceStatus.TO_PAY,
          supplierId: options.supplierId,
        },
        confidence: extractedData.confidence,
        extractedText,
        supplierInfo,
        requiresSupplierSelection: !options.supplierId && !supplierInfo.cuit,
        metadata: {
          language: options.language || Language.SPA,
          engine: options.ocrEngine || OcrEngine.OPENAI,
          temperature: options.temperature || 0.1,
          processingTime,
        },
        iibb_detected_terms: detectedTerms,
      };
    } catch (error) {
      throw new Error(`Error parseando respuesta OCR: ${error.message}`);
    }
  }

  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    return sharp.default(buffer)
      .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  private formatAndValidateCuit(cuit: string): string {
    if (!cuit) return '';
    
    const formatted = formatCuit(cuit);
    
    if (!validateCuit(formatted)) {
      this.logger.warn(`⚠️ CUIT extraído por OCR no es válido: ${cuit} -> ${formatted}`);
      return '';
    }
    
    this.logger.log(`✅ CUIT validado: ${cuit} -> ${formatted}`);
    return formatted;
  }
}
