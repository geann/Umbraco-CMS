import type { UmbCollectionFilterModel } from '@umbraco-cms/backoffice/collection';

export interface UmbMediaPickerCollectionFilterModel extends UmbCollectionFilterModel {
	unique?: string;
	dataTypeId?: string;
	orderBy?: string;
	orderDirection?: 'asc' | 'desc';
	userDefinedProperties: Array<{ alias: string; header: string; isSystem: boolean }>;
}

export interface UmbMediaPickerCollectionItemModel {
	unique: string;
	createDate: Date;
	creator?: string | null;
	icon: string;
	name: string;
	updateDate: Date;
	values: Array<{ alias: string; value: string }>;
}
