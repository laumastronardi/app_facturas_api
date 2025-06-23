// src/supabase/supabase.service.ts

import { Injectable }      from '@nestjs/common';
import { ConfigService }   from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(private readonly cfg: ConfigService) {
    this.client = createClient(
      cfg.get<string>('SUPABASE_URL')!,
      cfg.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  /** Si necesitas acceso total al cliente: */
  get raw(): SupabaseClient {
    return this.client;
  }

  /**
   * Helper para iniciar cualquier query .from()
   * No ponemos tipos aquí, TS infiere todo y vos podés
   * pasar el genérico exacto donde hagas .select<Invoice>()
   */
  from(table: string) {
    return this.client.from(table);
  }
}
