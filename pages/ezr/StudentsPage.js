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

  get filterRidersOnly() {
    return this.page.getByTestId(StudentsLocators.filterRidersOnly);
  }

  // User menu locators
  get userMenuTriggerLink() {
    return this.page.getByTestId(StudentsLocators.userMenuTriggerLink);
  }

  get userMenuLogoutLink() {
    return this.page.getByTestId(StudentsLocators.userMenuLogoutLink);
  }

  // Router view locator (for validation)
  get routerView() {
    return this.page.locator('router-view');
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

  // Filter methods
  async selectRidersOnlyFilter() {
    await this.studentFiltersDropdown.click();
    await this.page.waitForTimeout(500);
    await this.filterRiders.hover();
    await this.filterRidersOnly.click();
    await this.page.waitForTimeout(1500);
  }

  // Logout method
  async logout() {
    await this.userMenuTriggerLink.click();
    await this.page.waitForTimeout(500);
    await this.userMenuLogoutLink.click();
    await this.page.waitForTimeout(1000);
  }

  // Student card locators
  get firstStudentCard() {
    return this.page.locator('[data-testid^="student-card-"]').first();
  }

  get studentWheelchairCheckbox() {
    return this.page.getByTestId('student-wheelchair-checkbox');
  }

  get spedCheckbox() {
    return this.page.locator('[data-testid="SPED-checkbox"]');
  }

  // Student edit methods
  async openFirstStudentForEdit(baseUrl) {
    await this.firstStudentCard.waitFor({ state: 'visible', timeout: 60_000 });
    const testId = await this.firstStudentCard.getAttribute('data-testid');
    if (!testId) throw new Error('Unable to read first student-card data-testid.');

    const studentId = testId.split('-').pop();
    if (!studentId) throw new Error(`Unexpected student-card testid: ${testId}`);

    // Navigating by hash route is the most reliable way to open the record in automation.
    await this.page.goto(`${baseUrl}#/student/${studentId}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await this.studentWheelchairCheckbox.waitFor({ state: 'attached', timeout: 60_000 });

    return { studentId };
  }

  async toggleFlag(which) {
    if (which === 'sped') {
      const sped = this.spedCheckbox;
      await sped.waitFor({ state: 'attached', timeout: 30_000 });
      try {
        await sped.click();
      } catch {
        await sped.click({ force: true });
      }
      return { toggled: 'SPED' };
    }

    // Wheelchair is a wrapper; click the nested input if present.
    const wrapper = this.studentWheelchairCheckbox;
    await wrapper.waitFor({ state: 'visible', timeout: 30_000 });
    const input = wrapper.locator('input');
    const inputEl = (await input.count()) ? input.first() : null;
    const before = inputEl ? await inputEl.isChecked().catch(() => null) : null;

    // Try clicking wrapper/label first (some layouts have label intercepting input clicks).
    try {
      await wrapper.click();
    } catch {
      // ignore and try other strategies below
    }

    if (inputEl) {
      const afterWrapperClick = await inputEl.isChecked().catch(() => null);
      if (before !== null && afterWrapperClick === before) {
        const label = wrapper.locator('label').first();
        if (await label.count()) {
          try {
            await label.click();
          } catch {
            await label.click({ force: true });
          }
        } else {
          await inputEl.click({ force: true });
        }
      }
    }

    return { toggled: 'WHEELCHAIR' };
  }

  async clickSave() {
    // Save control is a material-icon text "save" in the action nav; no stable testid.
    await this.page.evaluate(() => {
      const leafs = Array.from(document.querySelectorAll('*'))
        .filter((el) => el.children.length === 0 && (el.textContent || '').trim() === 'save');
      const el = leafs[0];
      if (!el) throw new Error('Save icon not found');
      const clickable = el.closest('a,button,[role="button"],li,div') || el;
      clickable.click();
    });
  }

  async getLastUpdatedLine() {
    // Avoid grabbing giant container text; pick the shortest matching line.
    const line = await this.page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('div, span, p'))
        .map((el) => (el.textContent || '').trim())
        .filter((t) => t.startsWith('Last updated by') && t.includes('@') && t.length < 350);
      if (!texts.length) return null;
      texts.sort((a, b) => a.length - b.length);
      return texts[0];
    });
    return typeof line === 'string' ? line : null;
  }

  extractUpdatedTimestamp(text) {
    // Example: "Last updated by johan @ January 24, 2026 11:56 AM ..."
    const m = text.match(/@\s+([A-Za-z]+\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s+(AM|PM))/);
    return m ? m[1] : null;
  }

  async measureSaveTime() {
    const beforeLine = await this.getLastUpdatedLine();
    const beforeTs = beforeLine ? this.extractUpdatedTimestamp(beforeLine) : null;

    const start = Date.now();
    await this.clickSave();

    // Wait until the "Last updated by" timestamp changes.
    const timeoutAt = Date.now() + 60_000;
    let afterLine = beforeLine;
    let afterTs = beforeTs;

    while (Date.now() < timeoutAt) {
      await this.page.waitForTimeout(250);
      const currentLine = await this.getLastUpdatedLine();
      const currentTs = currentLine ? this.extractUpdatedTimestamp(currentLine) : null;
      if (currentTs && beforeTs && currentTs !== beforeTs) {
        afterLine = currentLine;
        afterTs = currentTs;
        break;
      }
      if (currentTs && !beforeTs) {
        afterLine = currentLine;
        afterTs = currentTs;
        break;
      }
    }

    const elapsedMs = Date.now() - start;

    return {
      elapsedMs,
      lastUpdatedBefore: beforeTs || '(unparsed)',
      lastUpdatedAfter: afterTs || '(unparsed)',
      lastUpdatedLineBeforeWasPresent: Boolean(beforeLine),
      lastUpdatedLineAfterWasPresent: Boolean(afterLine)
    };
  }
}
