// Дочерние сессии, чей прогон кончился (граф nks-dev: #6361): мост ребёнка
// погашен вместе с местом-спутником, и без пометки его следующий вызов ушёл бы
// мостом корня — запись подписалась бы местом запустившего, а leave дела вывел
// бы из дела его самого. Пометка живёт в памяти плагина до нового iskron_stand.
import { type Place, STAND_TOOL } from "./satellite.ts";

/**
 * Чтения, которые кончившийся ребёнок ведёт мостом корня: они не подписаны
 * местом и ничего не пишут. Прочее — записи графа, дело, канал кроме доски — отказ.
 */
const PLACELESS = new Set([
  "iskron_look",
  "iskron_orient",
  "iskron_search",
  "iskron_semantic_search",
  "iskron_history",
  "iskron_me",
]);

export interface RunEnds {
  /** Прогон ребёнка кончился; of — место корня, спутником которого он стоял. */
  mark(session: string, of: Place | null | undefined): void;
  /** Ребёнок встал заново — пометка снята. */
  stood(session: string): void;
  /** Бросает отказ вслух, если вызову кончившегося ребёнка нужно место. */
  guard(session: string, name: string, args: Record<string, unknown>): void;
}

export function createRunEnds(): RunEnds {
  const ended = new Map<string, Place | null>();
  return {
    mark: (session, of) => void ended.set(session, of ?? null),
    stood: (session) => void ended.delete(session),
    guard(session, name, args) {
      if (!ended.has(session) || name === STAND_TOOL || PLACELESS.has(name)) return;
      if (args.action === "?" || (name === "iskron_channel" && args.action === "list")) return;
      const of = ended.get(session)?.name ?? "<место запустившего>";
      throw new Error(
        `Отказано (плагин): прогон этой дочерней сессии кончился, её место-спутник отпущено — ` +
          `${name} подписал бы запись местом запустившего. Встань заново: ` +
          `iskron_stand(realm, karta, satellite_of="${of}"), затем повтори вызов.`,
      );
    },
  };
}
