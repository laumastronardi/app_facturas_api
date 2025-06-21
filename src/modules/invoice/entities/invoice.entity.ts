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

  @Column('decimal')
  amount: number;

  @Column('decimal', { default: 0 })
  vat: number;

  @Column({ type: 'enum', enum: InvoiceStatus })
  status: InvoiceStatus;

  @ManyToOne(() => Supplier, (supplier) => supplier.invoices)
  supplier: Supplier;

  @Column({ type: 'enum', enum: ['A', 'X'] })
  type: 'A' | 'X';

  @Column({ type: 'date', nullable: true })
  paymentDate?: Date;
}