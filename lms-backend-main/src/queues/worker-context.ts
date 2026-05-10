/**
 * Determines whether the current process should host BullMQ workers
 * (i.e. `@Processor` classes).
 *
 * Rules:
 *   - `IS_WORKER=true`  (set by worker.ts)      → always yes.
 *   - `WORKERS_IN_API=false`                     → no (API-only mode).
 *   - default                                     → yes.
 *
 * Import this from module files to conditionally add processor providers:
 *   providers: [SmsService, ...(shouldHostWorkers() ? [SmsProcessor] : [])]
 */
export function shouldHostWorkers(): boolean {
  if (process.env.IS_WORKER === 'true') return true;
  if (process.env.WORKERS_IN_API === 'false') return false;
  return true;
}
