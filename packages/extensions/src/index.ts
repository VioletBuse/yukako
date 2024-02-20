export * from './dist';
import type { KvNamespace } from '../extensions/kv/index';
import { SiteNamespace } from '../extensions/sites';

import type { RouterEnv } from '../workers/router';

export type RouterMeta = RouterEnv['__meta'];
export type KvNamespaceInternalType = KvNamespace;
export type SiteNamespaceInternalType = SiteNamespace;
