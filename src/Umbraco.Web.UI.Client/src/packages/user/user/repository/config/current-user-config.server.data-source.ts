import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UserService } from '@umbraco-cms/backoffice/external/backend-api';
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';

export class UmbCurrentUserConfigServerDataSource {
	#host;

	constructor(host: UmbControllerHost) {
		this.#host = host;
	}

	/**
	 * Get the current user configuration.
	 * @memberof UmbCurrentUserConfigServerDataSource
	 */
	getCurrentUserConfig() {
		return tryExecuteAndNotify(this.#host, UserService.getUserCurrentConfiguration());
	}
}
