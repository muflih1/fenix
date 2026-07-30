import * as Scheduler from 'scheduler';

export const priorities = {
  Idle: Scheduler.unstable_IdlePriority,
  Low: Scheduler.unstable_LowPriority,
  Normal: Scheduler.unstable_NormalPriority,
  Immediate: Scheduler.unstable_ImmediatePriority,
  UserBlocking: Scheduler.unstable_UserBlockingPriority,
}

export function scheduleNormalPriCallback(
  callback: Scheduler.FrameCallbackType,
) {
  return Scheduler.unstable_scheduleCallback(
    Scheduler.unstable_NormalPriority,
    callback,
  );
}
