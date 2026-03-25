import { APIEmbedField, BaseGuildTextChannel, ChatInputCommandInteraction, GuildMember, User } from "discord.js";
import { getLogModerationChannel } from "utils/discord/getLogModerationChannel";
import { BaseCommandType } from "utils/commands/baseCommand.types";
import { t } from "utils/locales/i18n";
import { logEmbed } from "./logEmbed";

type LogModerationType = Exclude<BaseCommandType, "lock-channel" | "unlock-channel">

type LogChannelType = Extract<BaseCommandType, "lock-channel" | "unlock-channel">;

export const manuelModerationLogEmbed = async (interaction: ChatInputCommandInteraction, type: LogModerationType, vars : {
  user: GuildMember | User | null,
  reason?: string,
  duration?: string|number
}) => {
  if(!interaction.guild) return
    const channel = getLogModerationChannel(interaction.guild)

    if(!channel || !channel.isTextBased()) return;
    if(!vars.user) return;

    const fields : APIEmbedField[] = [{
      name: t(interaction, "embeds.logs.fields.user"),
      value: `\`${vars.user.displayName}\` (<@${vars.user.id}>)`,
      inline: true
    }, {
      name: t(interaction, "embeds.logs.fields.moderation"),
      value: `\`${interaction.user.tag}\` (<@${interaction.user.id}>)`,
      inline: true
    }]

    if(vars.duration) fields.push({
      name: t(interaction, "embeds.logs.fields.duration"),
      value: t(interaction, "embeds.logs.fields.duration.value", {duration : String(vars.duration)}),
    })

    if(vars.reason) fields.push({
      name: t(interaction, "embeds.logs.fields.reason"),
      value: vars.reason ?? t(interaction, "moderation.no_reason"),
    })

    let description;

    switch (type) {
      case "ban":
        description = t(interaction, "moderation.ban_description")
        break;
      case "kick":
        description = t(interaction, "moderation.kick_description")
        break;
      case "mute":
        description = t(interaction, "moderation.mute_description")
        break;
      case "purge-message":
        description = t(interaction, "moderation.purge_description")
        break;
      case "rename-member":
        description = t(interaction, "moderation.rename_description")
        break;
      case "reset-member-nickname":
        description = t(interaction, "moderation.reset_nickname_description")
        break;
      case "unban":
        description = t(interaction, "moderation.unban_description")
        break;
      case "unmute":
        description = t(interaction, "moderation.unmute_description")
        break;
    }

    const embed = logEmbed({
      lang: interaction.locale.split("-")[0],
      type: "moderation",
      description,
      fields
    });

    channel.send({
      embeds: [embed],
    })
}

export const manuelChannelLogEmbed = async (interaction: ChatInputCommandInteraction, type: LogChannelType, vars: {
  channel: BaseGuildTextChannel | null
}) => {
  if(!interaction.guild) return;
  const channel = getLogModerationChannel(interaction.guild)

  if(!channel || !channel.isTextBased()) return;
  if(!vars.channel) return;

  const fields : APIEmbedField[] = [{
      name: t(interaction, "embeds.logs.fields.channel"),
      value: `\`${vars.channel.name}\` (<#${vars.channel.id}>)`,
      inline: true
    }, {
      name: t(interaction, "embeds.logs.fields.moderation"),
      value: `\`${interaction.user.tag}\` (<@${interaction.user.id}>)`,
      inline: true
    }]

  let description;
  switch (type) {
    case "lock-channel":
      description = t(interaction, "moderation.ban_description")
      break;
    case "unlock-channel":
      description = t(interaction, "moderation.unmute_description")
      break;
  }

  const embed = logEmbed({
    lang: interaction.locale.split("-")[0],
    type: "moderation",
    description,
    fields
  });

  channel.send({
    embeds: [embed],
  })
}