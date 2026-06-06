declare module 'node-cron' {
  export interface Task {
    start: () => void
    stop: () => void
    destroy: () => void
    nextDates: (num?: number) => any
  }

  export interface ScheduleOptions {
    scheduled?: boolean
    timezone?: string
    recoverMissedExecutions?: boolean
  }

  export function schedule(expression: string, func: () => void, options?: ScheduleOptions): Task
  export default { schedule }
}
