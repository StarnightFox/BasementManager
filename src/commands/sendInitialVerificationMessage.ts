import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ButtonBuilder, PermissionFlagsBits, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { envParseString } from '@skyra/env-utilities';

@ApplyOptions<Command.Options>({
	name: 'sendInitialMessage',
	description: 'Sends the initial verification message',
	preconditions: ['OwnerOnly']
})
export class SendInitialVerificationMessageCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) => {
				builder
					.setName(this.name)
					.setDescription(this.description)
					.setDMPermission(false)
					.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
			},
			{
				guildIds: [envParseString('GUILD_ID')]
			}
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) return interaction.reply('This command can only be used in a guild.');
		try {
			const channel = await interaction.guild.channels.fetch(envParseString('VERIFY_CHANNEL_ID'));
			if (!channel) return interaction.reply('The verification channel could not be found');
			if (!channel.isTextBased()) return interaction.reply('Please make sure the channel is a text channel');

			const verifyButton = new ButtonBuilder().setCustomId('verifyButton').setLabel('Verify').setStyle(ButtonStyle.Success);
			const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);

			const message = await channel.send({
				content: 'Please click the button below to verify yourself',
				components: [buttonRow]
			});

			return interaction.reply(`The initial verification message has been sent, it can be found here: ${message.url}`);
		} catch (error) {
			this.container.logger.error(error);
			return interaction.reply('An error occurred while sending the initial verification message. Check your console for more information.');
		}
	}
}
