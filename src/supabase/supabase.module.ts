// src/supabase/supabase.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule }    from '@nestjs/config';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  imports: [ConfigModule],    // Carga tu .env
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
