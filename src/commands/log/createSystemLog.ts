import { 
  ChatInputCommandInteraction, 
  InteractionContextType, 
  PermissionFlagsBits, 
  SlashCommandBuilder,
  MessageFlags,
  ChannelType,
} from "discord.js";
import { catchErrorInCommand } from "utils/validation/errorDuringCommand";
import { 
  IC_ThinSpace,
  IC_ZeroWidthSpace,
  IC_ZeroWidthJoiner,
  IC_ZeroWidthNonJoiner,
} from "utils/consts/invisiblesChars";
import { reply } from "utils/discord/reply";
import { t } from "utils/locales/i18n";
import { logPanelContainer } from "utils/discord/logPanelContainer";

export const data = new SlashCommandBuilder()
.setName("log")
.setNameLocalizations({
  fr: "logs",
})
.setDescription("Configure the server logging system.")
.setDescriptionLocalizations({
  fr: "Configurer le système de logs du serveur.",
})
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.setContexts(InteractionContextType.Guild);

export const cooldown = 5;

export const main = async (interaction: ChatInputCommandInteraction) => {
  try {
    const guild = interaction.guild;
    if(!guild) return; 
    let channel;

    const channels = guild.channels.cache.filter(ch => {
      if (!ch.isTextBased()) return false;
      if (!("topic" in ch)) return false;
      return true;
    });

    const hasMessageLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthSpace));
    const hasRoleLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthNonJoiner));
    const hasChannelLog = channels.some(ch => ("topic" in ch) && ch.topic?.includes(IC_ZeroWidthJoiner));

    const existing = channels.find(ch => ("topic" in ch) && ch.topic?.includes(IC_ThinSpace));

    if (existing && existing.isTextBased() && "messages" in existing) {
      const messages = await existing.messages.fetch({ limit: 10 });

      const botMessage = messages.find(m => 
        m.author.id === guild.members.me?.id &&
        m.components.length > 0
      );

      if (botMessage) {
        return await reply(interaction, {
          key: "errors.log_already_exist",
          ephemeral: true,
          type: "error",
        });
      }

      channel = existing;
    }

    if (!channel) {
      const category = await guild.channels.create({
        name: t(interaction, "channel.log_system"),
        type: ChannelType.GuildCategory,
      });

      channel = await guild.channels.create({
        name: "dashboard",
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `Somes ${IC_ThinSpace} Informations...`,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });
    }

    const container = logPanelContainer({
      hasRoleLog,
      interaction,
      hasChannelLog,
      hasMessageLog,
    });

    await channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    await reply(interaction, {
      key: "embeds.logs.successful_created",
      ephemeral: true,
      type: "info",
      vars: {
        channel: `<#${channel.id}>`
      }
    })

  } catch (err) {
    catchErrorInCommand(err, interaction, "CreateLogSystem");
  }
};