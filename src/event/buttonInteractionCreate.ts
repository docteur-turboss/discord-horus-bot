import { ButtonInteraction, Events, GuildMember } from "discord.js";
import { followUp, reply } from "utils/discord/reply";
import { logger } from "utils/logger/logger";
import { buttonsCommands } from "buttons";
import { ROLE_REACT_PREFIX, ROLE_REACT_WIZARD_PREFIX } from "utils/consts/roleReactTypes";

export const data = {
  event: Events.InteractionCreate,
}

const handleRoleReactButton = async (interaction: ButtonInteraction) => {
  if (!interaction.guild || !interaction.member) return;
  const member = interaction.member as GuildMember;
  const roleId = interaction.customId.slice(ROLE_REACT_PREFIX.length);
  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    return await reply(interaction, {
      key: "role_react.role_not_found",
      type: "error",
      ephemeral: true,
    });
  }

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(roleId);
    return await reply(interaction, {
      key: "role_react.role_removed",
      type: "info",
      ephemeral: true,
      vars: { role: role.name },
    });
  }

  await member.roles.add(roleId);
  return await reply(interaction, {
    key: "role_react.role_added",
    type: "success",
    ephemeral: true,
    vars: { role: role.name },
  });
};

export const main = async (interaction: ButtonInteraction) => {
	if (!interaction.isButton()) return;
	if(interaction.customId.startsWith(ROLE_REACT_WIZARD_PREFIX)) return;
	if(interaction.customId.startsWith(ROLE_REACT_PREFIX)) return handleRoleReactButton(interaction);
	if(interaction.customId === "confirm_action" || interaction.customId === "cancel_action") return;
	if(interaction.customId.startsWith("send_")) return;
	if(interaction.customId.startsWith("rules.accept_")) return;
	const command = buttonsCommands.getButton(interaction.customId);

	if (!command) {
		logger.error(`No command matching ${interaction.id} was found.`);
		return await reply(interaction, { 
			key: "errors.no_command_found", 
			ephemeral: true,
			type: "error",
		});
	}

	try {
		await command.main(interaction);
	} catch (error) {
		logger.error("Error executing button " + interaction.id, error as Record<string, unknown>);

		if (interaction.replied || interaction.deferred) return await followUp(interaction, {
			key: "errors.command_execution",
			type: "error",
			ephemeral: true
		})
			
    await reply(interaction, {
			key: "errors.command_execution",
			ephemeral: true,
			type: "error",
		});
  }
};