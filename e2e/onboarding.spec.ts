import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test('should complete onboarding successfully', async ({ page }) => {
    // 1. Aller sur la page de login
    await page.goto('/login')

    // 2. S'inscrire
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("S\'inscrire")')

    // 3. Devrait être redirigé vers l'onboarding
    await expect(page).toHaveURL(/\/onboarding/)

    // 4. Remplir l'étape 1 - Identité
    await page.fill('input#name', 'Test Restaurant')
    await page.click('button:has-text("Suivant")')

    // 5. Naviguer à travers les étapes (placeholders pour le moment)
    await page.click('button:has-text("Suivant")')
    await page.click('button:has-text("Suivant")')
    await page.click('button:has-text("Suivant")')
    await page.click('button:has-text("Suivant")')

    // 6. Terminer l'onboarding
    await page.click('button:has-text("Terminer")')

    // 7. Devrait être redirigé vers le dashboard
    await expect(page).toHaveURL(/\/app/)
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login')

    // S'inscrire
    await page.fill('input[type="email"]', 'test2@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("S\'inscrire")')

    await expect(page).toHaveURL(/\/onboarding/)

    // Essayer de passer sans remplir le nom
    await page.click('button:has-text("Suivant")')

    // Le formulaire devrait empêcher la soumission (HTML5 validation)
    await expect(page).toHaveURL(/\/onboarding/)
  })
})

test.describe('Authentication', () => {
  test('should login with existing account', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'demo@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Se connecter")')

    await expect(page).toHaveURL(/\/app/)
  })

  test('should require authentication for protected routes', async ({
    page,
  }) => {
    await page.goto('/app')

    // Devrait être redirigé vers login
    await expect(page).toHaveURL(/\/login/)
  })
})
