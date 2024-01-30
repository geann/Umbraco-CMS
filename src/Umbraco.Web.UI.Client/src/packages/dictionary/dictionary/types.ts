import type { UmbDictionaryEntityType } from './entity.js';

export interface UmbDictionaryDetailModel {
	entityType: UmbDictionaryEntityType;
	unique: string;
	name: string;
	translations: Array<UmbDictionaryTranslationModel>;
}

export interface UmbDictionaryTranslationModel {
	isoCode: string;
	translation: string;
}
