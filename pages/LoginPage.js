export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  // Locators
  get emailOrPhoneInput() {
    return this.page.getByRole('textbox', { name: 'Email or Phone' });
  }

  get passwordInput() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    await this.page.goto('https://routing-uat.transact.com/admin');
  }

  async login(email, password) {
    await this.emailOrPhoneInput.click();
    await this.emailOrPhoneInput.fill(email);

    await this.passwordInput.click();
    await this.passwordInput.fill(password);

    await this.loginButton.click();
  }
}
