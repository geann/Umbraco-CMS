import { manifests as entityActionManifests } from './entity-action/manifests.js';
import { manifests as menuItemManifests } from './menu-item/manifests.js';
import { manifests as repositoryManifests } from './repository/manifests.js';
import { manifests as treeManifests } from './tree/manifests.js';
import { manifests as workspaceManifests } from './workspace/manifests.js';

export const manifests = [
	...entityActionManifests,
	...menuItemManifests,
	...repositoryManifests,
	...treeManifests,
	...workspaceManifests,
];
