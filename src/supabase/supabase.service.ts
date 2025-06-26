// src/supabase/supabase.service.ts

import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  /** Si necesitas acceso total al cliente: */
  get raw(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Helper para iniciar cualquier query .from()
   * No ponemos tipos aquí, TS infiere todo y vos podés
   * pasar el genérico exacto donde hagas .select<Invoice>()
   */
  from(table: string) {
    return this.supabase.from(table);
  }
}
