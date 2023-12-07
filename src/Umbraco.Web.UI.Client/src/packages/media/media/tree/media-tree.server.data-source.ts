import { UmbMediaTreeItemModel } from './types.js';
import { UmbTreeServerDataSourceBase } from '@umbraco-cms/backoffice/tree';
import { MediaResource, MediaTreeItemResponseModel } from '@umbraco-cms/backoffice/backend-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

/**
 * A data source for the Media tree that fetches data from the server
 * @export
 * @class UmbMediaTreeServerDataSource
 * @extends {UmbTreeServerDataSourceBase}
 */
export class UmbMediaTreeServerDataSource extends UmbTreeServerDataSourceBase<
	MediaTreeItemResponseModel,
	UmbMediaTreeItemModel
> {
	/**
	 * Creates an instance of UmbMediaTreeServerDataSource.
	 * @param {UmbControllerHost} host
	 * @memberof UmbMediaTreeServerDataSource
	 */
	constructor(host: UmbControllerHost) {
		super(host, {
			getChildrenOf,
			mapper,
		});
	}
}

const getChildrenOf = (parentUnique: string | null) => {
	if (parentUnique === null) {
		return MediaResource.getTreeMediaRoot({});
	} else {
		return MediaResource.getTreeMediaChildren({
			parentId: parentUnique,
		});
	}
};

const mapper = (item: MediaTreeItemResponseModel): UmbMediaTreeItemModel => {
	return {
		id: item.id!,
		parentId: item.parentId!,
		name: item.name!,
		type: 'media',
		hasChildren: item.hasChildren!,
		isContainer: item.isContainer!,
		noAccess: item.noAccess!,
		isTrashed: item.isTrashed!,
	};
};
