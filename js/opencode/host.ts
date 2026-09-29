// Что хост плагина — сам OpenCode — говорит о себе и о сессии, для половины
// «тулы» (tools.ts). Из plugin.ts здесь только тип — рантайм-цикла импорта нет.
import { HARNESS_VERSION_ENV } from "../shared/clients.ts";
import type { Context } from "./plugin.ts";

/**
 * Версия самого OpenCode — мосту окружением (#6226): клиент рукопожатия — этот
 * плагин, и его clientInfo.version не версия хоста. Нет app — ничего не объявляем.
 */
export function hostEnvOf(ctx: Context): Record<string, string> {
  const v = (ctx as { app?: { version?: unknown } | null }).app?.version;
  return typeof v === "string" && v.trim() ? { [HARNESS_VERSION_ENV]: v.trim() } : {};
}

/**
 * Директория сессии — рабочая копия, над которой идёт ход: у SessionInfo
 * OpenCode 2 она в location.directory (@opencode/plugin 2.0.4). Нет её —
 * пусто, мост выведет из своего cwd.
 */
export async function sessionDirectory(ctx: Context, sessionID: string): Promise<string | null> {
  try {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- ответ хоста без схемы */
    const res: any = await ctx.session.get({ sessionID } as any);
    const dir = res?.location?.directory ?? res?.data?.location?.directory;
    return typeof dir === "string" && dir.trim() ? dir : null;
  } catch {
    return null;
  }
}
