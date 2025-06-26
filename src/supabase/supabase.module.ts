// src/supabase/supabase.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule }    from '@nestjs/config';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [ConfigModule],    // Carga tu .env
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
