import type { Platform } from '@platform/types.js';
import type { DisplayMode } from '@platform/types.js';
import { createExtStorage } from './storage.js';
import { createExtContent } from './content.js';
import { createExtHost } from './host.js';
import { createExtExport } from './export.js';
import { createExtTTS } from './tts.js';

export function createExtPlatform(mode: DisplayMode = 'sidepanel'): Platform {
  return {
    storage: createExtStorage(),
    content: createExtContent('content'),
    host: createExtHost(mode),
    export: createExtExport(),
    tts: createExtTTS(),
  };
}
