import { NonThreadGuildBasedChannel, Role } from "discord.js";
import { formatPerm } from "utils/helper/formatPerm";

export const formatChannelPermissions = (
  channel: NonThreadGuildBasedChannel,
  lang: string,
  limit = 10
) => {
  return (
    channel.permissionOverwrites.cache
      .map((o) => {
        const allowed = o.allow.toArray().map((p) => formatPerm(p, lang));
        const denied = o.deny.toArray().map((p) => formatPerm(p, lang));

        return [
          allowed.length ? `+ ${allowed.join(", ")}` : null,
          denied.length ? `- ${denied.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .filter(Boolean)
      .slice(0, limit)
      .join("\n\n") || "*none*"
  );
};

export const formatRolePermissions = (
  role: Role,
  lang: string,
  limit = 10
) => {
  const perms = role.permissions.toArray().map((p) => formatPerm(p, lang));

  if (!perms.length) return "*none*";

  return perms.slice(0, limit).join(",\n") + (perms.length > limit ? "\n..." : "");
};

export const diffRolePermissions = (
  oldRole: Role,
  newRole: Role,
  lang: string,
  limit = 10
) => {
  if (oldRole.permissions.bitfield === newRole.permissions.bitfield) return null;

  const oldPerms = new Set(oldRole.permissions.toArray());
  const newPerms = new Set(newRole.permissions.toArray());

  const added = [...newPerms].filter((p) => !oldPerms.has(p));
  const removed = [...oldPerms].filter((p) => !newPerms.has(p));

  const format = (arr: string[], prefix: string) => {
    if (!arr.length) return null;

    const mapped = arr.map((p) => formatPerm(p, lang));
    const sliced = mapped.slice(0, limit);

    return `${prefix}\n\`${sliced.join("`,\n`")}\`${mapped.length > limit ? "\n..." : ""}`;
  };

  const addBlock = format(added, "+");
  const removeBlock = format(removed, "-");

  return [addBlock, removeBlock].filter(Boolean).join("\n=====================\n") || "*updated*";
};