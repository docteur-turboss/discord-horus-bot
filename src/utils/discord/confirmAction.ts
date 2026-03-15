import {
  ChatInputCommandInteraction,
  ComponentType,
} from "discord.js";
import { createConfirmationButtons } from "utils/buttons/confirmationBtn";
import { reply, editReply } from "utils/discord/reply";

type ConfirmOptions = {
  confirmKey: string
  successKey?: string
  vars?: Record<string, string>
  onConfirm: () => Promise<unknown>
};

export async function confirmAction(
  interaction: ChatInputCommandInteraction,
  options: ConfirmOptions
) {
  const row = createConfirmationButtons(interaction);
  const msg = await reply(interaction, {
    key: options.confirmKey,
    vars: options.vars,
    components: [row],
    type: "warning",
  });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 15_000,
  });

  collector.on("collect", async (i) => {
    if (i.user.id !== interaction.user.id) return;
    if (i.customId === "cancel_action") {
      collector.stop("cancelled");

      return editReply(interaction, {
        key: "moderation.action_cancelled",
        components: [],
        type: "info",
      });
    }

    if (i.customId === "confirm_action") {
      collector.stop("confirmed");

      try{
        await options.onConfirm();

        if (options.successKey) {
          await editReply(interaction, {
            key: options.successKey,
            vars: options.vars,
            components: [],
          });
        }
      } catch {}
    }
  });

  collector.on("end", async (_, reason) => {
    if (reason === "time") {
      await editReply(interaction, {
        key: "moderation.action_expired",
        components: [],
        type: "info",
      });
    }
  });
}