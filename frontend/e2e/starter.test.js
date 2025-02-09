const { reloadApp } = require("detox-expo-helpers");

describe("Example", () => {
  beforeEach(async () => {
    await reloadApp();
  });

  test('navigates to Home screen after login', async () => {
    // Simulate user interaction on the login screen
    await element(by.id("loginButton")).tap(); // Make sure your LoginScreen has a component with testID="loginButton"
    
    // Wait for the Home screen element to appear (using its accessibility label)
    await waitFor(element(by.label("Home")))
      .toBeVisible()
      .withTimeout(5000);
    
    // Assert that the Home screen is visible
    await expect(element(by.label("Home")).atIndex(0)).toBeVisible();
  });
});
