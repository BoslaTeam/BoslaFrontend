/**
 * Business rule: the join window for a video consultation opens exactly
 * 10 minutes before the appointment's scheduled start time.
 *
 * Keep this as the single source of truth — every "can join now" gate must
 * reference it rather than hardcoding a duration.
 */
export const JOIN_WINDOW_MINUTES = 10;

/** Join window expressed in milliseconds, for direct comparison against timestamps. */
export const JOIN_WINDOW_MS = JOIN_WINDOW_MINUTES * 60 * 1000;
