import type { Page, Locator } from '@playwright/test';

export class StudentsPage {
  constructor(private readonly page: Page) {}

  // Navigation
  get navStudentsLink(): Locator {
    return this.page.getByTestId('nav-students-link');
  }

  // Search
  get searchBox(): Locator {
    return this.page.getByRole('searchbox', { name: 'search' });
  }

  // Student list
  get studentListCount(): Locator {
    return this.page.getByTestId('student-list-count');
  }

  // Student list panel
  get studentListPanel(): Locator {
    return this.page.getByTestId('student-list-panel');
  }

  // Actions
  async navigateToStudents(): Promise<void> {
    await this.navStudentsLink.click();
  }

  async clearSearch(): Promise<void> {
    await this.searchBox.click();
    await this.searchBox.fill('');
  }

  async getStudentCount(): Promise<string> {
    return await this.studentListCount.textContent() || '';
  }

  async waitForStudentList(): Promise<void> {
    await this.studentListPanel.waitFor({ state: 'visible', timeout: 60_000 });
  }
}
