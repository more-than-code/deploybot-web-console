import { expect, test } from '@playwright/test';

test('unauthenticated user is redirected to signin', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('form')).toContainText('Sign in');
});
