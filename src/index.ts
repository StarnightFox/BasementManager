import '#lib/setup';
import { envParseString } from '@skyra/env-utilities';
import BasementClient from '#lib/structures/BasementClient';

const client = new BasementClient();

try {
	client.logger.info('Logging in');
	await client.login(envParseString('DISCORD_TOKEN'));
	client.logger.info('logged in');
} catch (error) {
	client.logger.fatal(error);
	client.destroy();
	process.exit(1);
}
