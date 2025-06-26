import { Module, Controller, Get, All } from '@nestjs/common';
import { SupplierModule } from './modules/supplier/supplier.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';

console.log('AppModule: before @Module');

@Controller()
export class AppController {
  @Get()
  getHello(): { message: string; status: string; timestamp: string } {
    console.log('AppController: GET / called');
    return {
      message: 'Bills API is running!',
      status: 'OK',
      timestamp: new Date().toISOString()
    };
  }

  @All('*')
  catchAll() {
    console.log('AppController: Catch-all route called');
    return {
      message: 'Route not found',
      status: '404',
      availableRoutes: [
        '/suppliers',
        '/suppliers/health',
        '/invoices'
      ]
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],  // o el path correcto a tu .env
    }),
    SupabaseModule,
    SupplierModule,
    InvoiceModule,
  ],
  controllers: [AppController]
})
export class AppModule {
  constructor() {
    console.log('AppModule: constructor');
  }
}
