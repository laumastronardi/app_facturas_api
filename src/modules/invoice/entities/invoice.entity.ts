import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Supplier } from '../../supplier/entities/supplier.entity';

export enum InvoiceStatus {
  TO_PAY = 'to_pay',
  PREPARED = 'prepared',
  PAID = 'paid',
}

export class Invoice {
  id: number;

  date: Date;

  amount: number;

  amount_105: number;

  total_neto: number;

  vat_amount_21: number;

  vat_amount_105: number;

  has_ii_bb: boolean;

  ii_bb_amount: number;

  total_amount: number;

  status: InvoiceStatus;

  supplier: Supplier;

  invoiceType: 'A' | 'X';

  paymentDate?: Date;
}