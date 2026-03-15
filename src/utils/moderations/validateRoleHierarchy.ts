import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { reply } from "utils/discord/reply";

export async function validateRoleHierarchy(
  interaction: ChatInputCommandInteraction,
  targetMember: GuildMember
) {

  if (
    interaction.member instanceof GuildMember &&
    interaction.member.roles.highest.position <= targetMember.roles.highest.position
  ) {
    await reply(interaction, {
      key: "errors.role_hierarchy",
      ephemeral: true,
      type: "error"
    });

    return false;
  }

  return true;
}