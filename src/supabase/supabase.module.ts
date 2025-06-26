// src/supabase/supabase.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule }    from '@nestjs/config';
import { SupabaseService } from './supabase.service';

console.log('SupabaseModule: before @Module');

@Global()
@Module({
  imports: [ConfigModule],    // Carga tu .env
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {
  constructor() {
    console.log('SupabaseModule: constructor');
  }
}
