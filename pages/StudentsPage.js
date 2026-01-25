import { StudentsLocators } from './locators/students-locators.js';

/**
 * Page Object Model for the Students page
 * Uses a mix of generated locators and hard-coded values where elements are dynamically loaded
 */
export class StudentsPage {
  constructor(page) {
    this.page = page;
  }

  // Navigation
  get navStudentsLink() {
    return this.page.getByTestId(StudentsLocators.navStudentsLink);
  }

  // Search
  get searchBox() {
    return this.page.getByRole('searchbox', { name: 'search' });
  }

  // Student list - These locators appear after page interaction, not in initial extraction
  get studentListCount() {
    return this.page.getByTestId('student-list-count');
  }

  get studentListPanel() {
    return this.page.getByTestId('student-list-panel');
  }

  // Student filters dropdown (from extracted locators)
  get studentFiltersDropdown() {
    return this.page.getByTestId(StudentsLocators.studentFiltersDropdown);
  }

  get studentGradesDropdown() {
    return this.page.getByTestId(StudentsLocators.studentGradesDropdown);
  }

  // Student batch edit panel (from extracted locators)
  get studentBatchEditPanel() {
    return this.page.getByTestId(StudentsLocators.studentBatchEditPanel);
  }

  get studentBatchEditSelectedCount() {
    return this.page.getByTestId(StudentsLocators.studentBatchEditSelectedCount);
  }

  // Student rows - Dynamic locators
  get studentRows() {
    return this.page.locator(`[data-testid*="student-row-"]`);
  }

  // Actions
  async navigateToStudents() {
    // Use direct URL navigation (same approach as navigation tests that work)
    const currentUrl = this.page.url();
    const baseUrl = currentUrl.split('#')[0];

    await this.page.evaluate((url) => {
      window.location.href = url;
    }, `${baseUrl}#/students`);

    // Wait for URL hash to change
    await this.page.waitForFunction(() => {
      return window.location.hash === '#/students';
    }, { timeout: 10_000 });

    // Wait for title to update
    await this.page.waitForFunction(() => {
      return document.title.includes('Students');
    }, { timeout: 10_000 });
  }

  async clearSearch() {
    await this.searchBox.click();
    await this.searchBox.fill('');
  }

  async getStudentCount() {
    // Try to find count by text pattern since testId doesn't exist
    // Look for pattern like "X / Y" in any visible text
    const countText = await this.page.locator('text=/\\d+ \\/ \\d+/').first().textContent({ timeout: 10_000 });
    return countText || '';
  }

  async waitForStudentList() {
    // Wait for the Students page to fully load by checking title
    await this.page.waitForFunction(() => {
      return document.title.includes('Students');
    }, { timeout: 10_000 });

    // Wait for the search box to be ready
    await this.searchBox.waitFor({ state: 'visible', timeout: 10_000 });

    // Additional wait for the list to fully render
    await this.page.waitForTimeout(2000);
  }

  async openFiltersDropdown() {
    await this.studentFiltersDropdown.click();
  }

  async openGradesDropdown() {
    await this.studentGradesDropdown.click();
  }

  async getVisibleStudentCount() {
    const rows = await this.studentRows.count();
    return rows;
  }

  async getBatchEditSelectedCount() {
    return await this.studentBatchEditSelectedCount.textContent() || '';
  }
}
