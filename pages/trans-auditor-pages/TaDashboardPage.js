/**
 * TransAuditor Dashboard Page Object
 *
 * Page object for TransAuditor dashboard (https://transauditor.qa.geodataintelligence.com)
 * Follows Selenide-style locator pattern
 */

import { expect } from '@playwright/test';

export class TaDashboardPage {
  constructor(page) {
    this.page = page;

    // Login locators
    this.usernameInput = page.getByRole('textbox', { name: 'Username Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });

    // Main navigation buttons
    this.dashboardButton = page.getByRole('button', { name: 'Dashboard' });
    this.plannedVsActualButton = page.getByRole('button', { name: 'Planned vs. Actual' });
    this.incidentTrackingButton = page.getByRole('button', { name: 'Incident Tracking' });
    this.tieringAnalysisButton = page.getByRole('button', { name: 'Tiering Analysis' });

    // Dashboard elements
    this.firstRowDiv = page.locator('.v-row.mx-2 > div').first();
    this.overviewText = page.getByText('Overview');
    this.userIcon = page.locator('i').nth(1);

    // Overview links
    this.plannedTripDurationLink = page.getByRole('link', { name: 'Planned Trip Duration (' });
    this.onTimeArrivalLink = page.getByRole('link', { name: 'On Time Arrival', exact: true });
    this.backButton = page.getByRole('button', { name: 'Back' });

    // Dashboard report links
    this.matchCategoriesLink = page.getByRole('link', { name: 'Match Categories' });
    this.openIncidentsLink = page.getByRole('link', { name: 'Open Incidents' });
    this.am10DayOTPLink = page.getByRole('link', { name: 'AM 10 Day OTP by School' });
    this.pmLastMatchedTripstopLink = page.getByRole('link', { name: 'PM Last Matched Tripstop' });
    this.amOnTimeArrivalLink = page.getByRole('link', { name: 'AM On Time Arrival' });
    this.pmOnTimeArrivalLink = page.getByRole('link', { name: 'PM On Time Arrival' });

    // Alerts section
    this.alertsText = page.getByText('Alerts');
    this.noGPSLink = page.getByRole('link', { name: 'No GPS (103)' });
    this.recurringUnmatchedTripsLink = page.getByRole('link', { name: 'Recurring Unmatched Trips (' });
    this.recurringMissedTripstopsLink = page.getByRole('link', { name: 'Recurring Missed Tripstops (' });
    this.chronicLateLink = page.getByRole('link', { name: 'Chronic Late to Plan School' });
    this.tripsWithoutSchoolArrivalLink = page.getByRole('link', { name: 'Trips without School Arrival' });
    this.amRecurringMissedFirstLink = page.getByRole('link', { name: 'AM Recurring Missed First' });
    this.chronicallyLateToFirstAMLink = page.getByRole('link', { name: 'Chronically Late to First AM' });

    // Incident Tracking in main area
    this.incidentTrackingMainText = page.getByRole('main').getByText('Incident Tracking');

    // Planned vs. Actual elements would go here
    this.searchInput = page.getByRole('textbox', { name: 'Search Search' });
    this.selectDateInput = page.getByRole('textbox', { name: 'Select Date(s) Select Date(s)' });
    this.exportButton = page.getByRole('button', { name: 'Export' });
    this.pvaAllButton = page.getByRole('button', { name: 'ALL' });
    this.pvaAmButton = page.getByRole('button', { name: 'AM' });
    this.pvaPmButton = page.getByRole('button', { name: 'PM' });
    this.pvaMiscButton = page.getByRole('button', { name: 'MISCELLANEOUS' });

    // Incident Tracking elements would go here
    this.incidentSearchTicketInput = page.getByRole('textbox', { name: 'Search by Ticket #' });
    this.incidentPlusButton = page.getByRole('button').nth(5);
    this.incidentNewTicketSearchModal = page.getByText('New Ticket');
    this.incidentAssignedToDropdown = page.getByRole('textbox', { name: 'Assigned To Assigned To' });
    this.incidentRouteDropdown = page.getByRole('textbox', { name: 'Route Route' });
    this.incidentPriorityDropdown = page.locator('.v-input.v-input--horizontal.v-input--center-affix.v-input--density-default.v-theme--myCustomLightTheme.v-locale--is-ltr.v-text-field.v-select > .v-input__control > .v-field > .v-field__field > .v-field__input').first();
    this.incidentCategoryDropdown = page.locator('.v-card-text > div:nth-child(3) > div > .v-input > .v-input__control > .v-field > .v-field__field > .v-field__input').first();
    this.incidentDescriptionTextarea = page.getByRole('textbox', { name: 'Description * Description *' });
    this.incidentTripDropdown = page.getByRole('textbox', { name: 'Trip Trip' });
    this.incidentVehicleDropdown = page.getByRole('textbox', { name: 'Vehicle Vehicle' });
    this.incidentDepotDropdown = page.getByRole('textbox', { name: 'Depot Depot' });
    this.incidentSchoolDropdown = page.getByRole('textbox', { name: 'School School' });
  }

  /**
   * Login to TransAuditor
   * @param {string} username - Username
   * @param {string} password - Password
   */
  async login(username, password) {
    await this.usernameInput.click();
    await this.usernameInput.fill(username);
    await this.usernameInput.press('Tab');
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Validate main navigation buttons are visible
   */
  async validateMainNavigation() {
    await expect(this.dashboardButton).toBeVisible();
    await expect(this.plannedVsActualButton).toBeVisible();
    await expect(this.incidentTrackingButton).toBeVisible();
    await expect(this.tieringAnalysisButton).toBeVisible();
  }

  /**
   * Validate dashboard overview section
   */
  async validateOverview() {
    await expect(this.firstRowDiv).toBeVisible();
    await this.overviewText.click();
    await expect(this.overviewText).toBeVisible();
    await expect(this.plannedTripDurationLink).toBeVisible();

    // Navigate through overview
    await this.onTimeArrivalLink.click();
    await this.backButton.click();
  }

  /**
   * Validate dashboard report links
   */
  async validateDashboardLinks() {
    await expect(this.userIcon).toBeVisible();
    await expect(this.matchCategoriesLink).toBeVisible();
    await expect(this.openIncidentsLink).toBeVisible();
    await expect(this.am10DayOTPLink).toBeVisible();
    await expect(this.pmLastMatchedTripstopLink).toBeVisible();
    await expect(this.amOnTimeArrivalLink).toBeVisible();
    await expect(this.pmOnTimeArrivalLink).toBeVisible();
  }

  /**
   * Validate alerts section
   */
  async validateAlerts() {
    await expect(this.alertsText).toBeVisible();
    await expect(this.noGPSLink).toBeVisible();
    await expect(this.recurringUnmatchedTripsLink).toBeVisible();
    await expect(this.recurringMissedTripstopsLink).toBeVisible();
    await expect(this.chronicLateLink).toBeVisible();
    await expect(this.tripsWithoutSchoolArrivalLink).toBeVisible();
    await expect(this.amRecurringMissedFirstLink).toBeVisible();
    await expect(this.chronicallyLateToFirstAMLink).toBeVisible();
  }

  async validateIncidentNewTicketModalElement() {
    await this.incidentNewTicketSearchModal.waitFor({ state: 'visible' });
    await expect(this.incidentNewTicketSearchModal).toBeVisible();
    await expect(this.incidentAssignedToDropdown).toBeVisible();
    await expect(this.incidentRouteDropdown).toBeVisible();
    await expect(this.incidentPriorityDropdown).toBeVisible();
    await expect(this.incidentCategoryDropdown).toBeVisible();
    await expect(this.incidentDescriptionTextarea).toBeVisible();
    await expect(this.incidentTripDropdown).toBeVisible();
    await expect(this.incidentVehicleDropdown).toBeVisible();
    await expect(this.incidentDepotDropdown).toBeVisible();
    await expect(this.incidentSchoolDropdown).toBeVisible();
  }

  /**
   * Validate incident tracking section
   */
  async validateIncidentTracking() {
    await this.incidentTrackingMainText.waitFor({ state: 'visible' });
    await expect(this.incidentTrackingMainText).toBeVisible();
  }

  /**
   * Validate all dashboard elements (comprehensive check)
   */
  async validateAllDashboardElements() {
    await this.validateMainNavigation();
    await this.validateOverview();
    await this.validateDashboardLinks();
    await this.validateAlerts();
    await this.validateIncidentTracking();
  }

  async clickPlannedVsActual() {
    await this.plannedVsActualButton.waitFor({ state: 'visible' });
    await this.plannedVsActualButton.click();
  }

  async clickIncidentTracking() {
    await this.incidentTrackingButton.waitFor({ state: 'visible' });
    await this.incidentTrackingButton.click();
  }

  async clickIncidentPlusButton() {
  await this.incidentPlusButton.waitFor({ state: 'visible' });
  await this.incidentPlusButton.click();
  await this.page.waitForLoadState('networkidle'); // Wait for modal to load
} 
}