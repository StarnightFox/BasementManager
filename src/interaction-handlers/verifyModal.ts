import { InteractionHandler, InteractionHandlerTypes, type PieceContext } from '@sapphire/framework';
import type { ModalSubmitInteraction } from 'discord.js';
import { envParseString } from '@skyra/env-utilities';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export class VerifyModalHandler extends InteractionHandler {
	public constructor(context: PieceContext, options: InteractionHandler.Options) {
		super(context, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.ModalSubmit
		});
	}

	public override parse(interaction: ModalSubmitInteraction) {
		if (interaction.customId !== 'verifyModal') return this.none();

		return this.some();
	}

	public async run(interaction: ModalSubmitInteraction) {
		if (!interaction.inCachedGuild()) return interaction.reply('This command can only be used in a guild.');

		const firstQuestion = 'How did you find this server?';
		const firstQuestionAnswer: string = interaction.fields.getTextInputValue('firstQuestionInput');

		const secondQuestion = 'Why would you like to join this server?';
		const secondQuestionAnswer: string = interaction.fields.getTextInputValue('secondQuestionInput');

		const thirdQuestion = 'Have you read and understood our rules?';
		const thirdQuestionAnswer: string = interaction.fields.getTextInputValue('thirdQuestionInput');

		const messageChannel = await interaction.guild.channels.fetch(envParseString('VERIFY_MESSAGE_CHANNEL_ID'));
		if (!messageChannel || !messageChannel.isTextBased()) throw new Error('Invalid message channel');

		try {
			await messageChannel.send({
				embeds: [
					new EmbedBuilder()
						.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
						.setTitle('New Verification Request')
						.addFields(
							{
								name: firstQuestion,
								value: firstQuestionAnswer
							},
							{
								name: secondQuestion,
								value: secondQuestionAnswer
							},
							{
								name: thirdQuestion,
								value: thirdQuestionAnswer
							}
						)
						.setColor(this.container.config.colours.default)
				],
				components: [this.makeButtons(interaction.user.id)]
			});

			return interaction.reply({
				content: 'Your verification request has been sent to the mods. Please wait for them to respond.',
				ephemeral: true
			});
		} catch (e) {
			this.container.logger.error(e);
			return interaction.reply({
				content: 'Im sorry, i failed to send your message to the mods. Please try again and if the issue persists, contact a mod.',
				ephemeral: true
			});
		}
	}

	private makeButtons(userId: string) {
		const approveButton = new ButtonBuilder().setCustomId(`approveButton.${userId}`).setLabel('Approve').setStyle(ButtonStyle.Success);

		const denyButton = new ButtonBuilder().setCustomId(`denyButton.${userId}`).setLabel('Deny').setStyle(ButtonStyle.Danger);

		const kickButton = new ButtonBuilder().setCustomId(`kickButton.${userId}`).setLabel('Kick').setStyle(ButtonStyle.Danger);

		const banButton = new ButtonBuilder().setCustomId(`banButton.${userId}`).setLabel('Ban').setStyle(ButtonStyle.Danger);

		return new ActionRowBuilder<ButtonBuilder>().addComponents(approveButton, denyButton, kickButton, banButton);
	}
}
