// seed.ts
import 'reflect-metadata';
import { DataSource, DeepPartial } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Invoice, InvoiceStatus } from './src/modules/invoice/entities/invoice.entity';
import { Supplier } from './src/modules/supplier/entities/supplier.entity';
import { InvoiceType } from './src/modules/invoice/dto/create-invoice.dto';

const AppDataSource = new DataSource(databaseConfig);

const FACTURA_CANTIDAD = parseInt(process.argv[2] || '50', 10); // ← parámetro por línea de comando

async function seed() {
  await AppDataSource.initialize();

  const supplierRepo = AppDataSource.getRepository(Supplier);
  const invoiceRepo = AppDataSource.getRepository(Invoice);

  // 🔹 Crear 5 proveedores faker
  const suppliers: Supplier[] = [];

  for (let i = 0; i < 5; i++) {
    const supplier = supplierRepo.create({
      name: faker.company.name(),
    });
    suppliers.push(await supplierRepo.save(supplier));
  }

  // 🔸 Crear facturas faker
  const invoices: DeepPartial<Invoice>[] = Array.from({ length: FACTURA_CANTIDAD }).map(() => {
    const randomStatus = faker.helpers.arrayElement(Object.values(InvoiceStatus));
    const randomType = faker.helpers.arrayElement(Object.values(InvoiceType));
    const vat = randomType === InvoiceType.A
      ? faker.helpers.arrayElement([10.5, 21])
      : undefined;

    return {
      date: faker.date.between({
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31'),
      }),
      amount: parseFloat(faker.finance.amount({ min: 500, max: 5000, dec: 2 })),
      status: randomStatus,
      type: randomType,
      vat,
      supplier: faker.helpers.arrayElement(suppliers),
    };
  });

  const invoiceEntities = invoiceRepo.create(invoices);
  await invoiceRepo.save(invoiceEntities);

  console.log(`✅ Se cargaron ${FACTURA_CANTIDAD} facturas con faker.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error ejecutando seed:', err);
  process.exit(1);
});
