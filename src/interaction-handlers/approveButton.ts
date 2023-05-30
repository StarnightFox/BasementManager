import { InteractionHandler, InteractionHandlerTypes, type PieceContext } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { envParseString } from '@skyra/env-utilities';
import { EmbedBuilder } from 'discord.js';

export class ApproveButtonHandler extends InteractionHandler {
	public constructor(context: PieceContext, options: InteractionHandler.Options) {
		super(context, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.Button
		});
	}

	public override parse(interaction: ButtonInteraction) {
		const customId = interaction.customId.split('.');
		if (customId[0] !== 'approveButton') return this.none();

		return this.some(customId[1]);
	}

	public async run(interaction: ButtonInteraction, userId: string) {
		if (!interaction.inCachedGuild()) return interaction.reply('This command can only be used in a guild.');

		try {
			await interaction.deferReply();
			const member = await interaction.guild.members.fetch(userId);
			if (!member) return interaction.editReply('Looks like that member is no longer in the server. You can delete this message');

			const memberRole = await interaction.guild.roles.fetch(envParseString('VERIFIED_ROLE_ID'));
			if (!memberRole) return interaction.editReply("I couldn't find the verified role. Please make sure it exists and try again.");

			await member.roles.add(memberRole);
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			await member.send(`Congratulations! You have been accepted in ${interaction.guild.name}`).catch(() => {});

			const welcomeChannel = await interaction.guild.channels.fetch(envParseString('WELCOME_CHANNEL_ID'));
			if (welcomeChannel && welcomeChannel.isTextBased()) {
				await welcomeChannel.send(`Lets all give ${member} a warm welcome to the server!`);
			}

			const newEmbed = EmbedBuilder.from(interaction.message.embeds[0])
				.setTitle('Member accepted')
				.setDescription(`Verification request approved by ${interaction.user}`)
				.setColor(this.container.config.colours.accepted);
			await interaction.message.edit({
				embeds: [newEmbed],
				components: []
			});

			return interaction.editReply('Member has been accepted.');
		} catch (e) {
			this.container.logger.error(e);
			return interaction.editReply({
				content: 'Something went wrong. Please try again later.'
			});
		}
	}
}
