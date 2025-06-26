import { Module, Controller, Get } from '@nestjs/common';
import { SupplierModule } from './modules/supplier/supplier.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';

@Controller()
export class AppController {
  @Get()
  getHello(): { message: string; status: string; timestamp: string } {
    return {
      message: 'Bills API is running!',
      status: 'OK',
      timestamp: new Date().toISOString()
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    SupabaseModule,
    SupplierModule,
    InvoiceModule,
  ],
  controllers: [AppController]
})
export class AppModule {}
