import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Invoice } from '../../invoice/entities/invoice.entity';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  cbu: string;

  @Column({ name: 'payment_term', default: 0 })
  paymentTerm: number;

  @OneToMany(() => Invoice, (invoice) => invoice.supplier)
  invoices: Invoice[];
}
