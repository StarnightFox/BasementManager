import { InteractionHandler, InteractionHandlerTypes, type PieceContext } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { ActionRowBuilder, GuildMember, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { envParseString } from '@skyra/env-utilities';

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
		if (!interaction.inCachedGuild()) return interaction.reply('This command can only be used in a guild.');

		const member = interaction.member as GuildMember;
		if (member && member.roles.cache.has(envParseString('VERIFIED_ROLE_ID')))
			return interaction.reply({ content: 'You are already verified.', ephemeral: true });

		return interaction.showModal(this.makeFirstModal());
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
