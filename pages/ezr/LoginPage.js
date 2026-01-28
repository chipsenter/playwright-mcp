import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: 'Email or Phone' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.loginWithGoogleButton = page.getByText('Login with Google');
    this.loginWithSAMLLink = page.getByRole('link', { name: ' Login with SAML' });
    this.welcomeHeading = page.getByRole('heading', { name: 'WELCOME' });
    this.newParentHeading = page.getByRole('heading', { name: 'New parent? Create an account' });
    this.parentRegistrationHeading = page.getByRole('heading', { name: 'PARENT REGISTRATION' });
    this.emailFieldParent = page.locator('input[type="email"]');
    this.firstNameInputParent = page.getByRole('textbox').nth(1);
    this.lastNameInputParent = page.getByRole('textbox').nth(2);
    this.phoneInputParent = page.getByRole('textbox').nth(3);
    this.passwordFieldParent = page.getByRole('textbox').nth(4);
    this.submitButton = page.getByText('Submit Cancel');
    this.cancelButton = page.getByText('Cancel')
    this.loginErrorMessage = page.getByText('Invalid Credentials');
  }

  async validateLoginPageElements() {
    await this.emailInput.isVisible();
    await this.passwordInput.isVisible();
    await this.loginButton.isVisible();
    await this.loginWithGoogleButton.isVisible();
    await this.loginWithSAMLLink.isVisible();
    await this.welcomeHeading.isVisible();
  }

  async validateLoginPagePresent() {
    await this.welcomeHeading.waitFor({ state: 'visible' });
    await expect(this.welcomeHeading).toBeVisible();
  }

  async validateLoginErrorMessage() {
    await this.loginErrorMessage.waitFor({ state: 'visible' });
    await expect(this.loginErrorMessage).toContainText('Invalid Credentials');
  }

  async openParentRegistrationModal() {
    await this.newParentHeading.click();
  }

  async validateParentRegistrationModalElements() {
    await this.parentRegistrationHeading.isVisible();
    await this.emailFieldParent.isVisible();
    await this.firstNameInputParent.isVisible();
    await this.lastNameInputParent.isVisible();
    await this.phoneInputParent.isVisible();
    await this.passwordFieldParent.isVisible();
    await this.submitButton.isVisible();
    await this.cancelButton.isVisible();
  }

  async clickParentRegistrationModalCancel() {
    await this.cancelButton.click();
  }

  async validateParentRegistrationModalElements() {
    await this.emailFieldParent.isVisible();
    await this.firstNameInputParent.isVisible();
    await this.lastNameInputParent.isVisible();
    await this.phoneInputParent.isVisible();
    await this.passwordFieldParent.isVisible();
    await this.submitButton.isVisible();
    await this.cancelButton.isVisible();
  }

  async goto() {
    await this.page.goto('https://routing-uat.transact.com/admin');
  }

  async login(email, password) {
    await this.emailInput.click();
    await this.emailInput.fill(email);

    await this.passwordInput.click();
    await this.passwordInput.fill(password);

    await this.loginButton.click();
  }
}
