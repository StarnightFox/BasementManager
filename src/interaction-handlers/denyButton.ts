import { InteractionHandler, InteractionHandlerTypes, type PieceContext } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Time } from '@sapphire/time-utilities';
import { codeBlock } from '@sapphire/utilities';

export class DenyButtonHandler extends InteractionHandler {
	public constructor(context: PieceContext, options: InteractionHandler.Options) {
		super(context, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override parse(interaction: ButtonInteraction) {
		const customId = interaction.customId.split('.');
		if (customId[0] !== 'denyButton') return this.none();

		return this.some(customId[1]);
	}

	public async run(interaction: ButtonInteraction, userId: string) {
		if (!interaction.inCachedGuild()) return interaction.reply('This command can only be used in a guild.');

		const reasonTextInput = new TextInputBuilder()
			.setLabel('Reason')
			.setPlaceholder('Please provide a reason for denying this user')
			.setRequired(true)
			.setCustomId('denyReason')
			.setMaxLength(1000)
			.setStyle(TextInputStyle.Paragraph);
		const reasonActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonTextInput);
		const reasonModal = new ModalBuilder().setTitle('Deny member').setCustomId('denyModal').addComponents(reasonActionRow);

		try {
			const member = await interaction.guild.members.fetch(userId);
			if (!member) return interaction.editReply('Looks like that member is no longer in the server. You can delete this message');

			await interaction.showModal(reasonModal);

			const submitted = await interaction.awaitModalSubmit({
				time: Time.Minute * 5,
				filter: (i) => i.user.id === interaction.user.id
			});

			if (!submitted) return interaction.editReply('You took to long to respond. Please try again.');

			const reason = submitted.fields.getTextInputValue('denyReason');

			const didSendDM = await member
				.send(`Your verification request has been denied in ${interaction.guild.name} for the following reason: \n${reason}`)
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.catch(() => {});

			const newEmbed = EmbedBuilder.from(interaction.message.embeds[0])
				.setTitle('Member denied')
				.setDescription(`Verification request denied by ${interaction.user} for the following reason: ${codeBlock(reason)}`)
				.setColor(this.container.config.colours.denied);
			await interaction.message.edit({
				embeds: [newEmbed],
				components: []
			});

			return submitted.reply(
				`Member has been denied. ${didSendDM ? `I have sent them a DM` : 'I could not send the member a dm, please try and do so yourself'}`
			);
		} catch (e) {
			this.container.logger.error(e);
			return interaction.editReply({
				content: 'Something went wrong. Please try again later.'
			});
		}
	}
}
