import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { codeBlock } from '@sapphire/utilities';

@ApplyOptions<Command.Options>({
	description: 'Displays the bot and API latency',
	fullCategory: ['Information']
})
export class PingCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return this.sendPing(interaction);
	}

	private async sendPing(interaction: Command.ChatInputCommandInteraction) {
		const initialEmbed = new EmbedBuilder().setDescription('Pinging...').setColor(this.container.config.colours.default);

		const pingMessage = await interaction.reply({ embeds: [initialEmbed], fetchReply: true });

		const finalEmbed = new EmbedBuilder()
			.addFields(
				{
					name: 'Bot Latency',
					value: `${codeBlock('ini', `[ ${this.container.client.ws.ping}ms ]`)}`,
					inline: true
				},
				{
					name: 'API Latency',
					value: `${codeBlock('ini', `[ ${pingMessage.createdTimestamp - interaction.createdTimestamp}ms ]`)}`,
					inline: true
				}
			)
			.setColor(this.container.config.colours.default);

		return interaction.editReply({
			embeds: [finalEmbed]
		});
	}
}
