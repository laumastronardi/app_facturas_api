import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Invoice } from '../../invoice/entities/invoice.entity';

export class Supplier {
  id: number;

  name: string;

  cuit: string;

  cbu: string;

  paymentTerm: number;

  invoices: Invoice[];
}
