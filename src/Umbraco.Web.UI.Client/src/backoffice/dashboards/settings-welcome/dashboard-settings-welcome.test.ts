import { expect, fixture, html } from '@open-wc/testing';

import { defaultA11yConfig } from '../../../core/helpers/chai';
import { UmbDashboardSettingsWelcomeElement } from './dashboard-settings-welcome.element';

describe('UmbDashboardSettingsWelcomeElement', () => {
	let element: UmbDashboardSettingsWelcomeElement;

	beforeEach(async () => {
		element = await fixture(html`<umb-dashboard-settings-welcome></umb-dashboard-settings-welcome>`);
	});

	it('is defined with its own instance', () => {
		expect(element).to.be.instanceOf(UmbDashboardSettingsWelcomeElement);
	});

	it('passes the a11y audit', async () => {
		await expect(element).to.be.accessible(defaultA11yConfig);
	});
});
