import { ButtonStyle, ContainerBuilder, PermissionFlagsBits, PermissionsBitField, SectionBuilder, VoiceChannel } from "discord.js";
import { t } from "utils/locales/i18n";
import { TranslationKey } from "utils/locales/i18n.types";

let cmdCache: Map<string, string> | null = null;

const cmdMention = (name: string): string => {
  const id = cmdCache?.get(name);
  return id ? `</${name}:${id}>` : `\`/${name}\``;
};

const ensureCmdCache = async (voiceChannel: VoiceChannel) => {
  if (cmdCache) return;
  const commands = await voiceChannel.guild.client.application!.commands.fetch();
  cmdCache = new Map(commands.map((c) => [c.name, c.id]));
};

export const buildTmpVoiceContainer = async (voiceChannel: VoiceChannel, lang: string) => {
  await ensureCmdCache(voiceChannel);

  const everyoneOverwrite = voiceChannel.permissionOverwrites.cache.get(voiceChannel.guild.roles.everyone.id);
  const isLocked = everyoneOverwrite?.deny.has(PermissionFlagsBits.Connect) ?? false;
  const isHidden = everyoneOverwrite?.deny.has(PermissionFlagsBits.ViewChannel) ?? false;
  const soundboardDenied = everyoneOverwrite?.deny.has(PermissionFlagsBits.UseSoundboard) ?? false;
  const webcamDenied = everyoneOverwrite?.deny.has(PermissionFlagsBits.Stream) ?? false;

  const toggleSection = (key: string, customId: string, isActive: boolean, activeStyle: ButtonStyle) =>
    (section: SectionBuilder) =>
      section
        .addTextDisplayComponents(textDisplay =>
          textDisplay.setContent(t(lang, `tmp_voice.button.${key}_label` as TranslationKey))
        )
        .setButtonAccessory(button =>
          button
            .setCustomId(customId)
            .setLabel(t(lang, (isActive ? `tmp_voice.button.${key}_on` : `tmp_voice.button.${key}_off`) as TranslationKey))
            .setStyle(isActive ? activeStyle : ButtonStyle.Secondary)
        );

  return new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`# ${t(lang, "tmp_voice.dashboard.title")}`)
    )
    .addSeparatorComponents((separator) => separator)
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`## ${t(lang, "tmp_voice.dashboard.category_permissions")}`)
    )
    .addSectionComponents(toggleSection("soundboard", "tmp_voice.toggle_soundboard", !soundboardDenied, ButtonStyle.Success))
    .addSectionComponents(toggleSection("webcam", "tmp_voice.toggle_webcam", !webcamDenied, ButtonStyle.Success))
    .addSectionComponents(toggleSection("lock", "tmp_voice.toggle_lock", !isLocked, ButtonStyle.Danger))
    .addSectionComponents(toggleSection("hide", "tmp_voice.toggle_hide", !isHidden, ButtonStyle.Secondary))
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`## ${t(lang, "tmp_voice.dashboard.category_commands")}`)
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`${cmdMention("voice-claim")} — ${t(lang, "tmp_voice.dashboard.cmd_claim")}`)
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`${cmdMention("voice-transfer")} — ${t(lang, "tmp_voice.dashboard.cmd_transfer")}`)
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`${cmdMention("voice-limit")} — ${t(lang, "tmp_voice.dashboard.cmd_limit")}`)
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`${cmdMention("voice-ban")} — ${t(lang, "tmp_voice.dashboard.cmd_ban")}`)
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`${cmdMention("voice-unban")} — ${t(lang, "tmp_voice.dashboard.cmd_unban")}`)
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`${cmdMention("voice-rename")} — ${t(lang, "tmp_voice.dashboard.cmd_rename")}`)
    )
    .addTextDisplayComponents((textDisplay) =>
      textDisplay.setContent(`${cmdMention("voice-owner")} — ${t(lang, "tmp_voice.dashboard.cmd_owner")}`)
    );
};

export const togglePermission = async (voiceChannel: VoiceChannel, permission: bigint) => {
  const everyoneRole = voiceChannel.guild.roles.everyone;
  const currentOverwrite = voiceChannel.permissionOverwrites.cache.get(everyoneRole.id);

  const currentAllow = currentOverwrite ? new PermissionsBitField(currentOverwrite.allow.bitfield) : new PermissionsBitField(0n);
  const currentDeny = currentOverwrite ? new PermissionsBitField(currentOverwrite.deny.bitfield) : new PermissionsBitField(0n);

  const isDenied = currentDeny.has(permission);

  const newAllow = new PermissionsBitField(currentAllow);
  const newDeny = new PermissionsBitField(currentDeny);

  if (isDenied) {
    newDeny.remove(permission);
    newAllow.add(permission);
  } else {
    newDeny.add(permission);
    newAllow.remove(permission);
  }

  const allOverwrites = voiceChannel.permissionOverwrites.cache.map((o) => ({
    id: o.id,
    type: o.type,
    allow: o.id === everyoneRole.id ? newAllow.bitfield : o.allow.bitfield,
    deny: o.id === everyoneRole.id ? newDeny.bitfield : o.deny.bitfield,
  }));

  await voiceChannel.edit({ permissionOverwrites: allOverwrites });
};
