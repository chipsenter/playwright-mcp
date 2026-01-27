export class DashboardPage {
  constructor(page) {
    this.page = page;
  }

  // Locators (based on codegen recording)
  get menuButton() {
    return this.page.locator('.col.m2').first();
  }

  get districtSearchBox() {
    return this.page.getByRole('searchbox', { name: 'search...' });
  }

  get openRoutingLink() {
    // Codegen produced a truncated accessible name; keep it tolerant.
    return this.page.getByRole('link', { name: /routing-uat\.transact\./i });
  }

  // Routing app nav (data-testid)
  get navDashboardLink() {
    return this.page.getByTestId('nav-dashboard-link');
  }

  get navStudentsLink() {
    return this.page.getByTestId('nav-students-link');
  }

  get navSchoolsLink() {
    return this.page.getByTestId('nav-schools-link');
  }

  get navVehiclesLink() {
    return this.page.getByTestId('nav-vehicles-link');
  }

  get navRoutesLink() {
    return this.page.getByTestId('nav-routes-link');
  }

  // Workspace (data-testid)
  get workspaceTitle() {
    return this.page.getByTestId('workspace-title');
  }

  get workspaceAddButton() {
    return this.page.getByTestId('workspace-add-btn');
  }

  get workspaceSaveButton() {
    return this.page.getByTestId('workspace-save-btn');
  }

  get workspaceActivateButton() {
    return this.page.getByTestId('workspace-activate-btn');
  }

  get workspaceDeleteButton() {
    return this.page.getByTestId('workspace-delete-btn');
  }

  get workspaceUpdateOkButton() {
    return this.page.getByRole('button', { name: 'Ok' });
  }

  get workspaceEditor() {
    return this.page.getByTestId('workspace-editor');
  }

  // Dialog/buttons (as recorded by codegen)
  get okButton() {
    return this.page.getByRole('button', { name: /^(Ok|OK)$/ });
  }

  get yesButton() {
    return this.page.getByRole('button', { name: 'Yes' });
  }

  // Workspace name input (codegen used the 2nd textbox on the dialog)
  get workspaceNameInput() {
    return this.page.getByRole('textbox').nth(1);
  }

  // Depots dropdown + menu item
  get depotsDropdown() {
    // Matches the editor dropdown text used by codegen: "Depots arrow_drop_down"
    return this.workspaceEditor.getByText(/Depots/i);
  }

  depotMenuItemAction(indexZeroBased) {
    // Codegen had an id like `#depots-mm28ti`; use a safer "id starts with depots-" selector.
    return this.page.locator('[id^="depots-"]:visible .menu-item-action').nth(indexZeroBased);
  }

  workspaceChipByName(name) {
    return this.page.getByTitle(`Workspace: ${name}`);
  }

  get deactivateButton() {
    return this.page.getByRole('button', { name: 'Deactivate' });
  }

  get workspaceList() {
    return this.page.getByTestId('workspace-list');
  }

  workspaceListItemByName(name) {
    return this.workspaceList.getByText(name);
  }

  async openMenu() {
    await this.menuButton.click();
  }

  async searchAndSelectDistrict(searchTerm, districtRowText) {
    await this.openMenu();

    await this.districtSearchBox.waitFor({ state: 'visible' });
    await this.districtSearchBox.click();
    await this.districtSearchBox.fill(searchTerm);

    await this.page.getByText(districtRowText).click();
  }

  async openRoutingInPopup() {
    const popupPromise = this.page.waitForEvent('popup');
    await this.openRoutingLink.click();
    return await popupPromise;
  }

  /**
   * Simple smoke navigation through main sections.
   * Intended to be used on the routing "popup" page after district selection.
   */
  async clickThroughMainNav() {
    await this.navDashboardLink.click();
    await this.navStudentsLink.click();
    await this.navSchoolsLink.click();
    await this.navVehiclesLink.click();
    // Some UIs expand vehicles on first click; keep your recorded double-click behavior.
    await this.navVehiclesLink.click();
    await this.navRoutesLink.click();
  }

  // Optional helper that mirrors your recorded workspace flow.
  async createActivateThenDeactivateWorkspace(workspaceName, depotOptionIndexZeroBased = 2) {
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
