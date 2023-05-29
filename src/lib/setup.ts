// Unless explicitly defined, set NODE_ENV as development:
import * as process from 'process';

process.env.NODE_ENV ??= 'development';

import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
import '@sapphire/plugin-hmr/register';
import { setup, type ArrayString } from '@skyra/env-utilities';
import * as colorette from 'colorette';
import { inspect } from 'util';
import { srcDir } from '#lib/constants';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Read env var
setup(new URL('.env.local', srcDir));

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });

declare module '@skyra/env-utilities' {
	interface Env {
		OWNERS: ArrayString;
		DISCORD_TOKEN: string;
	}
}
