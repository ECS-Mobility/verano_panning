import { toISODate } from '~/utils/plan'

/** Fecha de hoy reactiva ('YYYY-MM-DD', hora local). El plugin la refresca al enfocar. */
export function useToday() {
  return useState<string>('today', () => toISODate(new Date()))
}
