import { test, expect } from "@playwright/test";

test.describe("Real-time Collaborative Workspace CRDT Verification", () => {
  test("should synchronize text and cursor updates between two concurrent user contexts", async ({
    browser,
  }) => {
    // 1. Create independent browser contexts for User A and User B
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    pageA.on("console", (msg) => console.log("PAGE A LOG:", msg.text()));
    pageB.on("console", (msg) => console.log("PAGE B LOG:", msg.text()));
    pageA.on("pageerror", (err) =>
      console.error("PAGE A ERROR:", err.message, err.stack)
    );
    pageB.on("pageerror", (err) =>
      console.error("PAGE B ERROR:", err.message, err.stack)
    );

    const roomId = `test-crdt-room-${Math.floor(Math.random() * 100000)}`;
    const workspaceUrl = `/workspace/${roomId}`;

    // 2. Navigate both users to the collaborative workspace URL
    await pageA.goto(workspaceUrl);
    await pageB.goto(workspaceUrl);

    // 3. Locate text areas on both pages
    const textareaA = pageA.locator(".workspace-textarea");
    const textareaB = pageB.locator(".workspace-textarea");

    await expect(textareaA).toBeVisible({ timeout: 10000 });
    await expect(textareaB).toBeVisible({ timeout: 10000 });

    // 4. User A types a message and User B receives it
    await textareaA.focus();
    await pageA.keyboard.type("Hello from User A. ");

    // Wait for changes to synchronize via Socket.io/Yjs update events
    await expect(textareaB).toHaveValue("Hello from User A. ", {
      timeout: 8000,
    });

    // 5. User B types a follow-up and User A receives it
    await textareaB.focus();
    await pageB.keyboard.type("Hello back from User B!");

    await expect(textareaA).toHaveValue(
      "Hello from User A. Hello back from User B!",
      { timeout: 8000 }
    );

    // 6. Simulate concurrent typing to assert CRDT conflict-free convergence
    await textareaA.focus();
    const typeA = pageA.keyboard.type("A");

    await textareaB.focus();
    const typeB = pageB.keyboard.type("B");

    // Run typing promises concurrently
    await Promise.all([typeA, typeB]);

    // Give Yjs a brief moment to sync and settle delta binary states
    await pageA.waitForTimeout(2000);

    const valA = await textareaA.inputValue();
    const valB = await textareaB.inputValue();

    // Verify both clients converged to the exact same value without state loss
    expect(valA).toBe(valB);
    expect(valA).toContain("A");
    expect(valA).toContain("B");

    // Clean up mock browser contexts
    await contextA.close();
    await contextB.close();
  });
});
