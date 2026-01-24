import type { Page, Locator } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  // Locators
  get emailOrPhoneInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email or Phone' });
  }

  get passwordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Login' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://routing-uat.transact.com/admin');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailOrPhoneInput.click();
    await this.emailOrPhoneInput.fill(email);

    await this.passwordInput.click();
    await this.passwordInput.fill(password);

    await this.loginButton.click();
  }
}

