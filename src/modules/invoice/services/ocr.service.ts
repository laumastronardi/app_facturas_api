import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import sharp from 'sharp';
import { ConfigService } from '@nestjs/config';
import { CreateInvoiceDto, InvoiceType } from '../dto/create-invoice.dto';
import { InvoiceStatus } from '../entities/invoice.entity';
import { formatCuit, validateCuit } from '../../../common/utils/cuit-validator';

export interface OcrResult {
  invoiceData: Partial<CreateInvoiceDto>;
  confidence: number;
  extractedText: string;
  supplierInfo?: {
    name: string | null;
    cuit: string | null;
  };
}

@Injectable()
export class OcrService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for OCR functionality');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async processInvoiceImage(imageBuffer: Buffer): Promise<OcrResult> {
    try {
      // Optimizar la imagen para mejor OCR
      const optimizedImage = await this.optimizeImage(imageBuffer);
      
      // Convertir a base64 para enviar a OpenAI
      const base64Image = optimizedImage.toString('base64');
      
      // Procesar con OpenAI Vision
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analiza esta imagen de factura y extrae la siguiente información en formato JSON:
                {
                  "supplierName": "nombre del proveedor",
                  "supplierCuit": "CUIT del proveedor (formato XX-XXXXXXXX-X)",
                  "amount": número total sin IVA,
                  "amount_105": número con IVA 10.5%,
                  "total_neto": total neto,
                  "vat_amount_21": monto IVA 21%,
                  "vat_amount_105": monto IVA 10.5%,
                  "total_amount": monto total final,
                  "date": "YYYY-MM-DD",
                  "invoiceType": "A" o "X",
                  "confidence": porcentaje de confianza (0-100)
                }
                
                Si no puedes encontrar algún valor, usa 0 para números y null para strings.
                Busca especialmente:
                - CUIT del proveedor (formato XX-XXXXXXXX-X)
                - Fecha de la factura
                - Nombre del proveedor/empresa
                - Montos con y sin IVA
                - Tipo de factura (A, B, C, X, etc.)
                - Total final
                
                IMPORTANTE: El CUIT debe estar en formato XX-XXXXXXXX-X con guiones.
                
                Responde SOLO con el JSON, sin texto adicional.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      });

      const extractedText = response.choices[0]?.message?.content;
      if (!extractedText) {
        throw new BadRequestException('No se pudo procesar la imagen');
      }

      // Parsear la respuesta JSON
      let parsedData;
      try {
        // Limpiar la respuesta en caso de que tenga texto extra
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : extractedText;
        parsedData = JSON.parse(jsonString);
      } catch (parseError) {
        throw new BadRequestException('Error al procesar la respuesta del OCR');
      }

      // Mapear los datos extraídos a nuestro DTO
      const invoiceData: Partial<CreateInvoiceDto> = {
        amount: this.parseNumber(parsedData.amount),
        amount_105: this.parseNumber(parsedData.amount_105),
        total_neto: this.parseNumber(parsedData.total_neto),
        vat_amount_21: this.parseNumber(parsedData.vat_amount_21),
        vat_amount_105: this.parseNumber(parsedData.vat_amount_105),
        total_amount: this.parseNumber(parsedData.total_amount),
        date: parsedData.date || new Date().toISOString().split('T')[0],
        type: this.parseInvoiceType(parsedData.invoiceType),
        status: InvoiceStatus.TO_PAY, // Por defecto
      };

      return {
        invoiceData,
        confidence: parsedData.confidence || 75,
        extractedText,
        supplierInfo: parsedData.supplierName || parsedData.supplierCuit ? {
          name: parsedData.supplierName || null,
          cuit: this.formatCuit(parsedData.supplierCuit) || null,
        } : undefined,
      };

    } catch (error) {
      console.error('Error en OCR:', error);
      throw new BadRequestException(`Error procesando la imagen: ${error.message}`);
    }
  }

  private async optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Optimizar la imagen para mejor OCR
      return await sharp(imageBuffer)
        .resize(1024, 1024, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 90,
          progressive: true 
        })
        .toBuffer();
    } catch (error) {
      throw new BadRequestException('Error al procesar la imagen');
    }
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Limpiar el string y convertir a número
      const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private parseInvoiceType(value: any): InvoiceType {
    if (typeof value === 'string') {
      const upperValue = value.toUpperCase();
      if (upperValue === 'A') {
        return InvoiceType.A;
      }
      if (upperValue === 'X') {
        return InvoiceType.X;
      }
    }
    return InvoiceType.A; // Por defecto
  }

  private formatCuit(value: any): string | null {
    if (!value) return null;
    
    // Usar la función de validación y formateo del utils
    const formatted = formatCuit(value.toString());
    
    // Validar que el CUIT sea correcto
    if (!validateCuit(formatted)) {
      console.warn(`⚠️ CUIT extraído por OCR no es válido: ${value} -> ${formatted}`);
      return null;
    }
    
    console.log(`✅ CUIT validado: ${value} -> ${formatted}`);
    return formatted;
  }

  async findOrCreateSupplier(supplierName: string): Promise<number | null> {
    // Esta función se implementará para buscar o crear proveedores
    // Por ahora retornamos null para que el usuario seleccione manualmente
    return null;
  }
}
