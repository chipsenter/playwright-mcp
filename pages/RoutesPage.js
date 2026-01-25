/**
 * Page Object Model for the Routes page
 */
export class RoutesPage {
  constructor(page) {
    this.page = page;
  }

  // Navigation
  get navRoutesLink() {
    return this.page.getByTestId('nav-routes-link');
  }

  // Show Students dropdown and options
  get showStudentsDropdown() {
    // It's an anchor tag with "Show Students" text in the navigation
    return this.page.locator('a:has-text("Show Students")').first();
  }

  get showRoutedStudentsOption() {
    // Look for the "Show Routed Students" option in dropdown menu
    // It's an anchor tag with exact text "Show Routed Students"
    return this.page.locator('a:has-text("Show Routed Students")').first();
  }

  // Modal elements
  get studentModal() {
    return this.page.locator('[role="dialog"], .modal, [data-testid*="modal"], [data-testid*="student"]').first();
  }

  get studentModalTitle() {
    return this.page.locator('[role="dialog"] h1, [role="dialog"] h2, .modal h1, .modal h2').first();
  }

  get studentCountInModal() {
    // Look for count patterns in the modal
    return this.page.locator('[role="dialog"] text=/\\d+/, .modal text=/\\d+/').first();
  }

  // Actions
  async navigateToRoutes() {
    // Use direct URL navigation (same approach as other working tests)
    const currentUrl = this.page.url();
    const baseUrl = currentUrl.split('#')[0];

    await this.page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#/routes`);

    // Wait for URL hash to change (may include query parameters)
    await this.page.waitForFunction(() => {
      return window.location.hash.includes('/routes');
    }, { timeout: 10_000 });

    // Wait for title to update
    await this.page.waitForFunction(() => {
      return document.title.includes('Routes');
    }, { timeout: 10_000 });
  }

  async clickShowStudentsDropdown() {
    await this.showStudentsDropdown.waitFor({ state: 'visible', timeout: 10_000 });
    await this.showStudentsDropdown.click();
    await this.page.waitForTimeout(500);
  }

  async clickShowRoutedStudents() {
    await this.showRoutedStudentsOption.waitFor({ state: 'visible', timeout: 10_000 });
    await this.showRoutedStudentsOption.click();
    await this.page.waitForTimeout(1000);
  }

  async waitForStudentModal() {
    await this.studentModal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async getStudentCountFromModal() {
    try {
      // Wait for the student count element to appear
      // It appears as "Number of Students: X/ Y" format, but the numbers might be in child elements
      const studentCountLocator = this.page.locator('text=/Number of Students:/i').first();
      await studentCountLocator.waitFor({ state: 'visible', timeout: 15_000 });

      // Get the innerText (includes text from child elements)
      const text = await studentCountLocator.innerText();
      console.log(`Student count inner text found: "${text}"`);

      // Extract the numbers from "Number of Students: X/ Y"
      const match = text.match(/Number of Students:\s*(\d+)\s*\/\s*(\d+)/i);

      if (match) {
        const routedCount = parseInt(match[1], 10);
        const totalCount = parseInt(match[2], 10);
        console.log(`Found student count: ${routedCount} routed out of ${totalCount} total`);
        return totalCount; // Return total count
      }

      // If no match, try to find numbers in the same line
      const numberMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (numberMatch) {
        const totalCount = parseInt(numberMatch[2], 10);
        console.log(`Found count from numbers: ${numberMatch[1]}/${totalCount}`);
        return totalCount;
      }
    } catch (error) {
      console.error(`Error finding student count: ${error.message}`);
    }

    // Try alternative approach: look for parent div and get all text
    try {
      const parentDiv = await this.page.locator('div:has-text("Number of Students:")').first().innerText();
      console.log(`Parent div text: "${parentDiv}"`);
      const match = parentDiv.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        return parseInt(match[2], 10);
      }
    } catch (error) {
      console.error(`Alternative approach failed: ${error.message}`);
    }

    return null;
  }

  async validateRoutesUrl(expectedUrl) {
    const currentUrl = this.page.url();
    return currentUrl === expectedUrl || currentUrl.includes('#/routes');
  }
}
