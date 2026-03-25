import { AuditLogEvent, Guild } from "discord.js";

export const getExecutorFromAuditLog = async (
  guild: Guild,
  type: AuditLogEvent
) => {
  const log = await guild.fetchAuditLogs({ type }).catch(() => null);
  const entry = log?.entries.first();
  if (!entry) return null;

  const executor = entry.executor;
  if (executor?.partial) await executor.fetch().catch(() => null);

  if (!executor || executor.bot) return null;

  return executor;
};