import type { Page, Locator } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  // Locators (based on codegen recording)
  get menuButton(): Locator {
    return this.page.locator('.col.m2').first();
  }

  get districtSearchBox(): Locator {
    return this.page.getByRole('searchbox', { name: 'search...' });
  }

  get openRoutingLink(): Locator {
    // Codegen produced a truncated accessible name; keep it tolerant.
    return this.page.getByRole('link', { name: /routing-uat\.transact\./i });
  }

  // Routing app nav (data-testid)
  get navDashboardLink(): Locator {
    return this.page.getByTestId('nav-dashboard-link');
  }

  get navStudentsLink(): Locator {
    return this.page.getByTestId('nav-students-link');
  }

  get navSchoolsLink(): Locator {
    return this.page.getByTestId('nav-schools-link');
  }

  get navVehiclesLink(): Locator {
    return this.page.getByTestId('nav-vehicles-link');
  }

  get navRoutesLink(): Locator {
    return this.page.getByTestId('nav-routes-link');
  }

  // Workspace (data-testid)
  get workspaceTitle(): Locator {
    return this.page.getByTestId('workspace-title');
  }

  get workspaceAddButton(): Locator {
    return this.page.getByTestId('workspace-add-btn');
  }

  get workspaceSaveButton(): Locator {
    return this.page.getByTestId('workspace-save-btn');
  }

  get workspaceActivateButton(): Locator {
    return this.page.getByTestId('workspace-activate-btn');
  }

  get workspaceEditor(): Locator {
    return this.page.getByTestId('workspace-editor');
  }

  // Dialog/buttons (as recorded by codegen)
  get okButton(): Locator {
    return this.page.getByRole('button', { name: /^(Ok|OK)$/ });
  }

  get yesButton(): Locator {
    return this.page.getByRole('button', { name: 'Yes' });
  }

  // Workspace name input (codegen used the 2nd textbox on the dialog)
  get workspaceNameInput(): Locator {
    return this.page.getByRole('textbox').nth(1);
  }

  // Depots dropdown + menu item
  get depotsDropdown(): Locator {
    // Matches the editor dropdown text used by codegen: "Depots arrow_drop_down"
    return this.workspaceEditor.getByText(/Depots/i);
  }

  depotMenuItemAction(indexZeroBased: number): Locator {
    // Codegen had an id like `#depots-mm28ti`; use a safer "id starts with depots-" selector.
    return this.page.locator('[id^="depots-"]:visible .menu-item-action').nth(indexZeroBased);
  }

  workspaceChipByName(name: string): Locator {
    return this.page.getByTitle(`Workspace: ${name}`);
  }

  get deactivateButton(): Locator {
    return this.page.getByRole('button', { name: 'Deactivate' });
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
  }

  async searchAndSelectDistrict(searchTerm: string, districtRowText: string): Promise<void> {
    await this.openMenu();

    await this.districtSearchBox.waitFor({ state: 'visible' });
    await this.districtSearchBox.click();
    await this.districtSearchBox.fill(searchTerm);

    await this.page.getByText(districtRowText).click();
  }

  async openRoutingInPopup(): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup');
    await this.openRoutingLink.click();
    return await popupPromise;
  }

  /**
   * Simple smoke navigation through main sections.
   * Intended to be used on the routing "popup" page after district selection.
   */
  async clickThroughMainNav(): Promise<void> {
    await this.navDashboardLink.click();
    await this.navStudentsLink.click();
    await this.navSchoolsLink.click();
    await this.navVehiclesLink.click();
    // Some UIs expand vehicles on first click; keep your recorded double-click behavior.
    await this.navVehiclesLink.click();
    await this.navRoutesLink.click();
  }

  // Optional helper that mirrors your recorded workspace flow.
  async createActivateThenDeactivateWorkspace(workspaceName: string, depotOptionIndexZeroBased = 2): Promise<void> {
    await this.workspaceTitle.click();
    await this.workspaceAddButton.click();
    await this.workspaceSaveButton.click();

    await this.workspaceNameInput.click();
    await this.workspaceNameInput.fill(workspaceName);
    await this.okButton.click();

    await this.depotsDropdown.click();
    await this.depotMenuItemAction(depotOptionIndexZeroBased).click();

    await this.workspaceSaveButton.click();
    await this.okButton.click();

    await this.workspaceActivateButton.click();
    await this.yesButton.click();

    await this.workspaceChipByName(workspaceName).click();
    await this.deactivateButton.click();
    await this.yesButton.click();
  }
}

