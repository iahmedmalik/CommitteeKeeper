// Usage measurement with PulseMetrics. It counts that something happened, never who or where.
//
// Rule (PulseMetrics P-1): an event is a fixed name chosen here, in code, from this list, and nothing else.
// No page address (a member's link is a private token), no name, no amount, no phone number is ever passed in.
// The names are lowercase words joined by underscores, as PulseMetrics requires.

export const PULSE_EVENTS = [
  "member_link_opened", // someone opened a member's private page
  "payment_recorded", // an organiser saved a payment
  "committee_started", // an organiser started a committee
] as const;

export type PulseEventName = (typeof PULSE_EVENTS)[number];

type Pulse = { track?: (name: string) => void };

/** Sends one event, if PulseMetrics is installed. It never throws and never changes what the page does. */
export function track(name: PulseEventName): void {
  try {
    (globalThis as { pulse?: Pulse }).pulse?.track?.(name);
  } catch {
    // measuring must never break the app
  }
}
