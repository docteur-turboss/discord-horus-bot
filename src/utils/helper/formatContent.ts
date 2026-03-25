import { Message, OmitPartialGroupDMChannel, PartialMessage } from "discord.js";

export const formatContent = (
  message: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage<boolean>>
  | OmitPartialGroupDMChannel<Message<boolean>>
) => {
  if (!message) return "*unknown*";

  const content = message.content?.trim();

  if (content) {
    return truncate(content, 1024);
  }

  if (message.attachments.size > 0) {
    return "*[attachment]*";
  }

  if (message.embeds.length > 0) {
    return "*[embed]*";
  }

  return "*empty*";
};

export const truncate = (text: string, max: number) => {
  return text.length > max ? text.slice(0, max - 3) + "..." : text;
};