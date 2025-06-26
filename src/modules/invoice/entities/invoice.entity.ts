import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Supplier } from '../../supplier/entities/supplier.entity';

export enum InvoiceStatus {
  TO_PAY = 'to_pay',
  PREPARED = 'prepared',
  PAID = 'paid',
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  amount_105: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total_neto: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  vat_amount_21: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  vat_amount_105: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'enum', enum: InvoiceStatus })
  status: InvoiceStatus;

  @ManyToOne(() => Supplier, (supplier) => supplier.invoices)
  supplier: Supplier;

  @Column({ 
    type: 'enum', 
    enum: ['A', 'X'], 
    name: 'invoice_type' 
  })
  invoiceType: 'A' | 'X';

  @Column({ type: 'date', nullable: true })
  paymentDate?: Date;
}