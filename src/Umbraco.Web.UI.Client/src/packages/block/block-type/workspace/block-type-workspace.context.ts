import type { UmbBlockTypeBase } from '../types.js';
import { UMB_PROPERTY_CONTEXT, UmbPropertyDatasetContext } from '@umbraco-cms/backoffice/property';
import {
	UmbInvariantableWorkspaceContextInterface,
	UmbEditableWorkspaceContextBase,
	UmbWorkspaceContextInterface,
	UmbInvariantWorkspacePropertyDatasetContext,
} from '@umbraco-cms/backoffice/workspace';
import { UmbArrayState, UmbObjectState, appendToFrozenArray } from '@umbraco-cms/backoffice/observable-api';
import { UmbControllerHost, UmbControllerHostElement } from '@umbraco-cms/backoffice/controller-api';
import { UmbContextToken } from '@umbraco-cms/backoffice/context-api';
import { ManifestWorkspace, PropertyEditorConfigProperty } from '@umbraco-cms/backoffice/extension-registry';

export class UmbBlockTypeWorkspaceContext<BlockTypeData extends UmbBlockTypeBase = UmbBlockTypeBase>
	extends UmbEditableWorkspaceContextBase<never, BlockTypeData>
	implements UmbInvariantableWorkspaceContextInterface
{
	#entityType: string;
	#data = new UmbObjectState<BlockTypeData | undefined>(undefined);
	readonly data = this.#data.asObservable();

	// TODO: Get the name of the contentElementType..
	readonly name = this.#data.asObservablePart((data) => 'block');
	readonly unique = this.#data.asObservablePart((data) => data?.contentElementTypeKey);

	#properties = new UmbArrayState<PropertyEditorConfigProperty>([], (x) => x.alias);
	readonly properties = this.#properties.asObservable();

	constructor(host: UmbControllerHostElement, workspaceArgs: { manifest: ManifestWorkspace }) {
		// TODO: We don't need a repo here, so maybe we should not require this of the UmbEditableWorkspaceContextBase
		super(host, workspaceArgs.manifest.alias, undefined as never);
		this.#entityType = workspaceArgs.manifest.meta?.entityType;
	}

	createPropertyDatasetContext(host: UmbControllerHost): UmbPropertyDatasetContext {
		return new UmbInvariantWorkspacePropertyDatasetContext(host, this);
	}

	async load(unique: string) {
		this.consumeContext(UMB_PROPERTY_CONTEXT, (context) => {
			this.observe(context.value, (value) => {
				if (value) {
					const blockTypeData = value.find((x: UmbBlockTypeBase) => x.contentElementTypeKey === unique);
					if (blockTypeData) {
						this.#data.next(blockTypeData);
						return;
					}
				}
				// Fallback to undefined:
				this.#data.next(undefined);
			});
		});
	}

	async create(contentElementTypeId: string) {
		const data: BlockTypeData = {
			contentElementTypeKey: contentElementTypeId,
		} as BlockTypeData;

		this.setIsNew(true);
		this.#data.next(data);
		return { data };
	}

	getData() {
		return this.#data.getValue();
	}

	getEntityId() {
		return this.getData()!.contentElementTypeKey;
	}

	getEntityType() {
		return this.#entityType;
	}

	getName() {
		return 'block name content element type here...';
	}
	setName(name: string | undefined) {
		alert('You cannot set a name of a block-type.');
	}

	async propertyValueByAlias<ReturnType = unknown>(propertyAlias: string) {
		return this.#data.asObservablePart((data) => data?.[propertyAlias as keyof BlockTypeData] as ReturnType);
	}

	getPropertyValue<ReturnType = unknown>(propertyAlias: string) {
		return this.#data.getValue()?.[propertyAlias as keyof BlockTypeData] as ReturnType;
	}

	async setPropertyValue(alias: string, value: unknown) {
		const currentData = this.#data.value;
		if (currentData) {
			this.#data.update({ ...currentData, [alias]: value });
		}
	}

	async save() {
		if (!this.#data.value) return;

		this.consumeContext(UMB_PROPERTY_CONTEXT, (context) => {
			// TODO: We should most likely consume already, in this way I avoid having the reset this consumption.
			context.setValue(
				appendToFrozenArray(context.getValue() ?? [], this.#data.getValue(), (x) => x?.contentElementTypeKey),
			);
		});

		this.saveComplete(this.#data.value);
	}

	public destroy(): void {
		this.#data.destroy();
	}
}

export default UmbBlockTypeWorkspaceContext;

export const UMB_BLOCK_TYPE_WORKSPACE_CONTEXT = new UmbContextToken<
	UmbWorkspaceContextInterface,
	UmbBlockTypeWorkspaceContext
>(
	'UmbWorkspaceContext',
	undefined,
	(context): context is UmbBlockTypeWorkspaceContext => context.getEntityType?.() === 'data-type',
);
