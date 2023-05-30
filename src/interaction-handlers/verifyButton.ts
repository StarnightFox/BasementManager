import { InteractionHandler, InteractionHandlerTypes, type PieceContext } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Time } from '@sapphire/time-utilities';

export class VerifyButtonHandler extends InteractionHandler {
	public constructor(context: PieceContext, options: InteractionHandler.Options) {
		super(context, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override parse(interaction: ButtonInteraction) {
		if (interaction.customId !== 'verifyButton') return this.none();

		return this.some();
	}

	public async run(interaction: ButtonInteraction) {
		const reply = await interaction.reply({
			components: [this.makeButtonRow()],
			ephemeral: true
		});

		const collector = reply.createMessageComponentCollector({
			filter: (i) => i.user.id === interaction.user.id,
			time: Time.Minute * 30
		});

		collector.on('collect', async (i) => {
			switch (i.customId) {
				case 'modalButton.1': {
					await i.showModal(this.makeFirstModal());

					break;
				}
			}

			collector.stop();
		});

		collector.on('end', async (_, reason) => {
			if (reason === 'time') {
				await reply.edit({
					components: [],
					content: 'You took too long to answer the questions so your verification has been cancelled.\nplease try again.'
				});
			}

			return reply.delete();
		});
	}

	private makeButtonRow() {
		const firstButton = new ButtonBuilder().setCustomId('modalButton.1').setLabel('1').setStyle(ButtonStyle.Success);

		return new ActionRowBuilder<ButtonBuilder>().addComponents(firstButton);
	}

	private makeFirstModal() {
		const firstQuestionInput = new TextInputBuilder()
			.setCustomId('firstQuestionInput')
			.setLabel('How did you find this server?')
			.setPlaceholder('Friends, Google, etc.')
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(100)
			.setMinLength(5)
			.setRequired(true);
		const firstQuestionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(firstQuestionInput);

		const secondQuestionInput = new TextInputBuilder()
			.setCustomId('secondQuestionInput')
			.setLabel('Why would you like to join?')
			.setPlaceholder('To learn, to make friends, etc.')
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(500)
			.setMinLength(5)
			.setRequired(true);
		const secondQuestionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(secondQuestionInput);

		const thirdQuestionInput = new TextInputBuilder()
			.setCustomId('thirdQuestionInput')
			.setLabel('Have you read and understood the rules?')
			.setPlaceholder('Yes/No')
			.setStyle(TextInputStyle.Short)
			.setMaxLength(3)
			.setMinLength(1)
			.setRequired(true);
		const thirdQuestionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(thirdQuestionInput);

		return new ModalBuilder()
			.setCustomId('verifyModal')
			.setTitle('Verification')
			.addComponents(firstQuestionRow, secondQuestionRow, thirdQuestionRow);
	}
}
