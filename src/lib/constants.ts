import { URL } from 'node:url';

export const rootDir = new URL('../../', import.meta.url);
export const srcDir = new URL('src/', rootDir);

export const RandomLoadingMessage = ['Computing...', 'Thinking...', 'Cooking some food', 'Give me a moment', 'Loading...'];
