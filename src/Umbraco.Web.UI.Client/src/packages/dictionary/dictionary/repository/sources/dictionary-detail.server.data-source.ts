import { UmbId } from '@umbraco-cms/backoffice/id';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';
import type {
	CreateDictionaryItemRequestModel,
	DictionaryItemResponseModel,
	ImportDictionaryRequestModel,
	UpdateDictionaryItemRequestModel,
} from '@umbraco-cms/backoffice/backend-api';
import { DictionaryResource, LanguageResource } from '@umbraco-cms/backoffice/backend-api';
import type { UmbDataSource } from '@umbraco-cms/backoffice/repository';

/**
 * @description - A data source for the Dictionary detail that fetches data from the server
 * @export
 * @class UmbDictionaryDetailServerDataSource
 * @implements {DictionaryDetailDataSource}
 */
export class UmbDictionaryDetailServerDataSource
	implements
		UmbDataSource<
			CreateDictionaryItemRequestModel,
			string,
			UpdateDictionaryItemRequestModel,
			DictionaryItemResponseModel
		>
{
	#host: UmbControllerHost;

	constructor(host: UmbControllerHost) {
		this.#host = host;
	}

	/**
	 * @description - Creates a new Dictionary scaffold
	 * @param {string} parentId
	 * @return {*}
	 * @memberof UmbDictionaryDetailServerDataSource
	 */
	async createScaffold(parentId: string | null, preset?: Partial<CreateDictionaryItemRequestModel>) {
		const data = {
			name: '',
			translations: [],
			...preset,
			id: UmbId.new(),
			parentId,
		};

		return { data };
	}

	/**
	 * @description - Fetches a Dictionary with the given id from the server
	 * @param {string} id
	 * @return {*}
	 * @memberof UmbDictionaryDetailServerDataSource
	 */
	read(id: string) {
		return tryExecuteAndNotify(this.#host, DictionaryResource.getDictionaryById({ id }));
	}

	/**
	 * @description - Get the dictionary overview
	 * @param {number?} skip
	 * @param {number?} take
	 * @returns {*}
	 */
	list(skip = 0, take = 1000) {
		return tryExecuteAndNotify(this.#host, DictionaryResource.getDictionary({ skip, take }));
	}

	/**
	 * @description - Updates a Dictionary on the server
	 * @param {DictionaryDetails} dictionary
	 * @return {*}
	 * @memberof UmbDictionaryDetailServerDataSource
	 */
	async update(id: string, dictionary: UpdateDictionaryItemRequestModel) {
		if (!id) throw new Error('Id is missing');
		if (!dictionary) throw new Error('Dictionary is missing');

		const payload = { id, requestBody: dictionary };
		return tryExecuteAndNotify(this.#host, DictionaryResource.putDictionaryById(payload));
	}

	/**
	 * @description - Inserts a new Dictionary on the server
	 * @param {DictionaryDetails} data
	 * @return {*}
	 * @memberof UmbDictionaryDetailServerDataSource
	 */
	async create(data: CreateDictionaryItemRequestModel) {
		return tryExecuteAndNotify(this.#host, DictionaryResource.postDictionary({ requestBody: data }));
	}

	/**
	 * @description - Deletes a Dictionary on the server
	 * @param {string} id
	 * @return {*}
	 * @memberof UmbDictionaryDetailServerDataSource
	 */
	async delete(id: string) {
		if (!id) {
			throw new Error('Id is missing');
		}

		return await tryExecuteAndNotify(this.#host, DictionaryResource.deleteDictionaryById({ id }));
	}

	/**
	 * @description - Upload a Dictionary
	 * @param {ImportDictionaryRequestModel} formData
	 * @return {*}
	 * @memberof UmbDictionaryDetailServerDataSource
	 */
	async upload(formData: ImportDictionaryRequestModel) {
		return await tryExecuteAndNotify(
			this.#host,
			DictionaryResource.postDictionaryImport({
				requestBody: formData,
			}),
		);
	}

	async getLanguages() {
		// TODO => temp until language service exists. Need languages as the dictionary response
		// includes the translated iso codes only, no friendly names and no way to tell if a dictionary
		// is missing a translation
		return tryExecuteAndNotify(this.#host, LanguageResource.getLanguage({ skip: 0, take: 1000 }));
	}
}
