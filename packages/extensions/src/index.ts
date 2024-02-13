export * from './dist';
import type { KvNamespace } from '../extensions/kv/index';

import type { RouterEnv } from '../workers/router';

export type RouterMeta = RouterEnv['__meta'];
export type KvNamespaceInternalType = KvNamespace;
