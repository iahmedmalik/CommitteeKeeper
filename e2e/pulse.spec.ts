import { expect, test } from "@playwright/test";
import { PULSE_EVENTS } from "../src/lib/pulse";
import { ORGANISER_STATE, SIGNED_OUT, hasLogin, seedCommittee, tokenOf } from "./helpers";

// Usage measurement (PulseMetrics): only fixed event names leave the app, and never a member's private link.
// The real snippet is replaced by a stand-in that records what the page asks it to track, so these tests need
// no PulseMetrics server. The measurement tests run only on a build made with the three NEXT_PUBLIC_PULSE_*
// settings, for example:
//   NEXT_PUBLIC_PULSE_KEY=0123456789abcdef01234567 NEXT_PUBLIC_PULSE_SRC=https://pulse.test/p.js \
//   NEXT_PUBLIC_PULSE_API=https://pulse.test npm run test:e2e

const configured = Boolean(process.env.NEXT_PUBLIC_PULSE_KEY && process.env.NEXT_PUBLIC_PULSE_SRC && process.env.NEXT_PUBLIC_PULSE_API);

test.describe("PulseMetrics events", () => {
  test.use({ storageState: ORGANISER_STATE });
  test.skip(!hasLogin, "needs the test login");

  test("without the settings, no snippet is added at all", async ({ page }) => {
    test.skip(configured, "this build has the settings");
    await page.goto("/");
    expect(await page.locator("script[data-key]").count()).toBe(0);
  });

  test("opening a member's private link sends only a fixed event name, never the link", async ({ page, browser }, testInfo) => {
    test.skip(!configured, "needs a build with the NEXT_PUBLIC_PULSE_* settings");
    test.setTimeout(120_000);
    const { url } = await seedCommittee({ names: ["Ali", "Sara"], start: true });
    await page.goto(url);
    const token = await tokenOf(page, "Ali");
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const stranger = await browser.newContext({ storageState: SIGNED_OUT, baseURL: testInfo.project.use.baseURL });
    const member = await stranger.newPage();
    await member.route("https://pulse.test/**", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: "window.__pulseCalls=[];window.pulse={track:function(){window.__pulseCalls.push(Array.prototype.slice.call(arguments))}};",
      }),
    );
    const requested: string[] = [];
    member.on("request", (r) => requested.push(r.url()));
    await member.goto(`/m/${token}`);
    await expect(member.getByText("Hello Ali")).toBeVisible();
    await member.waitForFunction(() => (window as unknown as { __pulseCalls: unknown[] }).__pulseCalls.length > 0);

    const sent = await member.evaluate(() => (window as unknown as { __pulseCalls: unknown[][] }).__pulseCalls);
    expect(sent).toContainEqual(["member_link_opened"]);
    for (const call of sent) {
      expect(call, "exactly one argument, the event name").toHaveLength(1);
      expect(PULSE_EVENTS as readonly string[]).toContain(call[0]);
      expect(JSON.stringify(call)).not.toContain(token);
    }
    for (const u of requested.filter((x) => x.startsWith("https://pulse.test"))) expect(u).not.toContain(token);
    await stranger.close();
  });
});

test("the privacy page says how the app measures its own use, and no longer claims there is no analytics", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "How the app measures its own use" })).toBeVisible();
  await expect(page.getByText(/counts three things with PulseMetrics/)).toBeVisible();
  await expect(page.getByText(/never the page address \(so never a private link\)/i)).toBeVisible();
  await expect(page.getByText(/and no analytics/)).toHaveCount(0);
});
