const { rest } = window.MockServiceWorker;
import { umbDocumentData } from '../../data/document.data.js';
import { umbracoPath } from '@umbraco-cms/backoffice/utils';

// TODO: add schema
export const handlers = [
	rest.post<string[]>(umbracoPath('/document/trash'), async (req, res, ctx) => {
		console.warn('Please move to schema');
		const ids = await req.json();

		const trashed = umbDocumentData.trash(ids);

		return res(ctx.status(200), ctx.json(trashed));
	}),

	rest.get(umbracoPath('/document/root/allowed-document-types'), (req, res, ctx) => {
		const response = umbDocumentData.getAllowedDocumentTypesAtRoot();

		return res(ctx.status(200), ctx.json(response));
	}),

	rest.get(umbracoPath('/document/:id/allowed-document-types'), (req, res, ctx) => {
		const id = req.params.id as string;
		if (!id) return;

		const response = umbDocumentData.getDocumentByIdAllowedDocumentTypes(id);

		return res(ctx.status(200), ctx.json(response));
	}),

	rest.put(umbracoPath(`/document/:id`), async (req, res, ctx) => {
		const id = req.params.id as string;
		if (!id) return;
		const data = await req.json();
		if (!data) return;

		const saved = umbDocumentData.save(id, data);

		return res(ctx.status(200), ctx.json(saved));
	}),

	rest.get(umbracoPath('/document/:id'), (req, res, ctx) => {
		const id = req.params.id as string;
		if (!id) return;

		const document = umbDocumentData.getById(id);

		return res(ctx.status(200), ctx.json(document));
	}),

	rest.post(umbracoPath(`/document`), async (req, res, ctx) => {
		const data = await req.json();
		if (!data) return;

		umbDocumentData.insert(data);

		return res(ctx.status(200));
	}),
];
