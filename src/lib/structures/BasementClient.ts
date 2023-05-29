import { container, LogLevel, SapphireClient } from '@sapphire/framework';
import { ActivityType, type ColorResolvable, GatewayIntentBits, Partials } from 'discord.js';

export default class BasementClient extends SapphireClient {
	public constructor() {
		super({
			defaultPrefix: '>',
			regexPrefix: /^(hey +)?bot[,! ]/i,
			caseInsensitiveCommands: true,
			logger: {
				level: LogLevel.Debug
			},
			shards: 'auto',
			intents: [
				GatewayIntentBits.DirectMessageReactions,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.GuildModeration,
				GatewayIntentBits.GuildEmojisAndStickers,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.MessageContent
			],
			partials: [Partials.Channel],
			loadMessageCommandListeners: false,
			hmr: {
				enabled: process.env.NODE_ENV === 'development'
			},
			presence: {
				activities: [
					{
						name: 'you',
						type: ActivityType.Watching
					}
				],
				status: 'idle'
			}
		});
	}

	public override async login(token: string) {
		return super.login(token);
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public override async destroy() {
		return super.destroy();
	}
}

container.config = {
	colours: {
		default: '#fe9fc6'
	}
};

declare module '@sapphire/pieces' {
	interface Container {
		config: {
			colours: {
				default: ColorResolvable;
			};
		};
	}
}
