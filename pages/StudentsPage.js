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

  get studentSchoolsDropdown() {
    return this.page.getByTestId(StudentsLocators.studentSchoolsDropdown);
  }

  get studentVehiclesDropdown() {
    return this.page.getByTestId(StudentsLocators.studentVehiclesDropdown);
  }

  get studentOperationsDropdown() {
    return this.page.getByTestId(StudentsLocators.studentOperationsDropdown);
  }

  get studentReportsDropdown() {
    return this.page.getByTestId(StudentsLocators.studentReportsDropdown);
  }

  // Filter options
  get filterAny() {
    return this.page.getByTestId(StudentsLocators.filterAny);
  }

  get filterCustomFilters() {
    return this.page.getByTestId(StudentsLocators.filterCustomFilters);
  }

  get filterGeneral() {
    return this.page.getByTestId(StudentsLocators.filterGeneral);
  }

  get filterRiders() {
    return this.page.getByTestId(StudentsLocators.filterRiders);
  }

  get filterTransportPrograms() {
    return this.page.getByTestId(StudentsLocators.filterTransportPrograms);
  }

  get filterTransportPlans() {
    return this.page.getByTestId(StudentsLocators.filterTransportPlans);
  }

  get filterBusSchedules() {
    return this.page.getByTestId(StudentsLocators.filterBusSchedules);
  }

  get filterRidership() {
    return this.page.getByTestId(StudentsLocators.filterRidership);
  }

  get filterFamilyId() {
    return this.page.getByTestId(StudentsLocators.filterFamilyId);
  }

  get filterContacts() {
    return this.page.getByTestId(StudentsLocators.filterContacts);
  }

  get filterParents() {
    return this.page.getByTestId(StudentsLocators.filterParents);
  }

  get filterLocation() {
    return this.page.getByTestId(StudentsLocators.filterLocation);
  }

  get filterBusRegions() {
    return this.page.getByTestId(StudentsLocators.filterBusRegions);
  }

  get filterCustomRegions() {
    return this.page.getByTestId(StudentsLocators.filterCustomRegions);
  }

  get filterStudentInfo() {
    return this.page.getByTestId(StudentsLocators.filterStudentInfo);
  }

  get filterEthnicities() {
    return this.page.getByTestId(StudentsLocators.filterEthnicities);
  }

  get filterTransportCodes() {
    return this.page.getByTestId(StudentsLocators.filterTransportCodes);
  }

  get filterAdvancedSearch() {
    return this.page.getByTestId(StudentsLocators.filterAdvancedSearch);
  }

  // Workspace locators
  get workspaceAddBtn() {
    return this.page.getByTestId('workspace-add-btn');
  }

  get workspaceEditor() {
    return this.page.getByTestId('workspace-editor');
  }

  get workspaceStudentCountValue() {
    return this.page.getByTestId('workspace-student-count-value');
  }

  get workspaceSaveBtn() {
    return this.page.getByTestId('workspace-save-btn');
  }

  get workspaceActivateBtn() {
    return this.page.getByTestId('workspace-activate-btn');
  }

  get workspaceSelector() {
    return this.page.locator('workspace-selector');
  }

  get dashboardStudentsTotalValue() {
    return this.page.getByTestId('dashboard-students-total-value');
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

  async clickSchoolsDropdown() {
    await this.studentSchoolsDropdown.click();
  }

  async validateAllFilterDropdownsVisible() {
    await this.studentFiltersDropdown.waitFor({ state: 'visible', timeout: 10_000 });
    await this.studentSchoolsDropdown.waitFor({ state: 'visible', timeout: 10_000 });
    await this.studentGradesDropdown.waitFor({ state: 'visible', timeout: 10_000 });
    await this.studentVehiclesDropdown.waitFor({ state: 'visible', timeout: 10_000 });
    await this.studentOperationsDropdown.waitFor({ state: 'visible', timeout: 10_000 });
    await this.studentReportsDropdown.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async clickFiltersDropdown() {
    await this.studentFiltersDropdown.click();
  }

  async validateAllFilterOptionsVisible() {
    await this.filterAny.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterCustomFilters.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterGeneral.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterRiders.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterTransportPrograms.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterTransportPlans.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterBusSchedules.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterRidership.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterFamilyId.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterContacts.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterParents.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterLocation.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterBusRegions.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterCustomRegions.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterStudentInfo.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterEthnicities.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterTransportCodes.waitFor({ state: 'visible', timeout: 10_000 });
    await this.filterAdvancedSearch.waitFor({ state: 'visible', timeout: 10_000 });
  }

  // Workspace methods
  async clickWorkspaceAddBtn() {
    await this.workspaceAddBtn.click();
  }

  async clickDepotsDropdown() {
    await this.workspaceEditor.getByText('Depots arrow_drop_down').click();
  }

  async selectDepot(depotName) {
    // Wait for the depot option to be visible after dropdown click
    const depotOption = this.workspaceEditor.getByText(depotName);
    await depotOption.waitFor({ state: 'visible', timeout: 15_000 });
    await depotOption.click();
  }

  async clickWorkspaceSaveBtn() {
    await this.workspaceSaveBtn.click();
  }

  async clickWorkspaceActivateBtn() {
    await this.workspaceActivateBtn.click();
  }

  async getWorkspaceStudentCount() {
    return await this.workspaceEditor.getByTestId('workspace-student-count-value').textContent();
  }

  getWorkspaceItem(itemId) {
    return this.page.getByTestId(`workspace-item-${itemId}`);
  }
}
