import type { Platform } from '@platform/types.js';
import { createPwaStorage } from './storage.js';
import { createPwaContent } from './content.js';
import { createPwaHost } from './host.js';
import { createPwaExport } from './export.js';
import { createPwaTTS } from './tts.js';

export function createPwaPlatform(contentBase = '/content'): Platform {
  return {
    storage: createPwaStorage(),
    content: createPwaContent(contentBase),
    host: createPwaHost(),
    export: createPwaExport(),
    tts: createPwaTTS(),
  };
}
