import { eq } from 'drizzle-orm'
import { appSettings, db } from '@/lib/db'
import { PRO_PRICE_CENTS } from './niches'

/**
 * Preço do Pro lido do banco (app_settings, linha única id=1) — editável
 * direto no Neon sem precisar de deploy. Cai pro valor padrão de niches.ts
 * se a linha ainda não existir.
 */
export async function getProPriceCents(): Promise<number> {
  const [row] = await db
    .select({ proPriceCents: appSettings.proPriceCents })
    .from(appSettings)
    .where(eq(appSettings.id, 1))
    .limit(1)
  return row?.proPriceCents ?? PRO_PRICE_CENTS
}
