import { Module } from '@nestjs/common';
import { SupplierModule } from './modules/supplier/supplier.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';

console.log('AppModule: before @Module');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],  // o el path correcto a tu .env
    }),
    SupabaseModule,
    SupplierModule,
    InvoiceModule,
  ]
})
export class AppModule {
  constructor() {
    console.log('AppModule: constructor');
  }
}
