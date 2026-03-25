import { Events, Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";
import { getMessageLogChannel } from "utils/discord/getMessageLogChannel";
import { formatContent } from "utils/helper/formatContent";
import { logEmbed } from "utils/embeds/logEmbed";
import { logger } from "utils/logger/logger";
import { t } from "../utils/locales/i18n";

export const data = {
  event: Events.MessageUpdate,
};

export const main = async (
  oldMessage: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>,
  newMessage: OmitPartialGroupDMChannel<Message<boolean>>
) => {
  if (!oldMessage) return;
  if (!oldMessage.guild) return;
  if (oldMessage.author?.bot) return;

  try {
    if (oldMessage?.partial) await oldMessage.fetch().catch(() => null);
    if (newMessage.partial) await newMessage.fetch().catch(() => null);

    if (!oldMessage || !newMessage) return;
    if (oldMessage.content === newMessage.content) return;

    const guild = newMessage.guild;
    if(!guild) return;

    const logChannel = getMessageLogChannel(guild);
    if (!logChannel) return;

    const lang = guild.preferredLocale.split("-")[0]

    const embeds = logEmbed({
      type: "message",
      lang,
      description: t(lang, "embeds.logs.message.update.description"),
      fields: [
        {
          name: t(lang, "embeds.logs.fields.user"),
          value: `<@${newMessage.author.id}>`,
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.channel"),
          value: `<#${newMessage.channel.id}>`,
          inline: true,
        },
        {
          name: t(lang, "embeds.logs.fields.link"),
          value: `[Jump](${newMessage.url})`,
          inline: false,
        },
        {
          name: t(lang, "embeds.logs.fields.before"),
          value: formatContent(oldMessage),
          inline: false,
        },
        {
          name: t(lang, "embeds.logs.fields.after"),
          value: formatContent(newMessage),
          inline: false,
        },
      ],
    });

    logChannel.send({
      embeds: [embeds]
    })
  } catch (error) {
    logger.error("Error in message update events listener", error as Record<string, unknown>);
  }
};