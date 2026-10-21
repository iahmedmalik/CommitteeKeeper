import { afterEach, describe, expect, it, vi } from "vitest";
import { PULSE_EVENTS, track } from "./pulse";

const scope = globalThis as { pulse?: unknown };

afterEach(() => {
  delete scope.pulse;
});

describe("track", () => {
  it("does nothing when PulseMetrics is not installed", () => {
    expect(() => track("member_link_opened")).not.toThrow();
  });

  it("passes exactly the event name and nothing else", () => {
    const spy = vi.fn();
    scope.pulse = { track: spy };
    track("payment_recorded");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("payment_recorded");
    expect(spy.mock.calls[0]).toHaveLength(1);
  });

  it("never lets a failing tracker break the page", () => {
    scope.pulse = {
      track: () => {
        throw new Error("boom");
      },
    };
    expect(() => track("committee_started")).not.toThrow();
  });

  it("copes with a tracker that has no track function", () => {
    scope.pulse = {};
    expect(() => track("member_link_opened")).not.toThrow();
  });
});

describe("the event names", () => {
  it("are all fixed names PulseMetrics accepts: lowercase words joined by underscores, 2 to 40 characters", () => {
    for (const name of PULSE_EVENTS) {
      expect(name).toMatch(/^[a-z][a-z0-9_]{1,39}$/);
      expect(name).not.toMatch(/\d{3,}/);
      for (const word of name.split("_")) expect(word.length).toBeLessThanOrEqual(15);
    }
  });

  it("are all different", () => {
    expect(new Set(PULSE_EVENTS).size).toBe(PULSE_EVENTS.length);
  });

  it("say what happened, and none looks like a person, an address or a token", () => {
    for (const name of PULSE_EVENTS) {
      expect(name).not.toMatch(/token|link_code|phone|email|http|\/|@|amount/);
    }
  });
});
