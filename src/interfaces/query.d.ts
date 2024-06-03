export interface QueryUpsert {
  table: string;
  onConflict: string;
  update: Record<string, any>;
  create: Record<string, any>;
}
