import { Client, Guild, TextChannel } from "discord.js";
import { AUTO_ROLE_TOPIC_MARKER, getAutoRoleTopic } from "utils/consts/autoRoleTypes";
import { DASHBOARD_TOPIC } from "utils/consts/logTypes";
import { logger } from "utils/logger/logger";

class AutoRoleManager {
  private autoRoles: Map<string, string | null> = new Map();

  private dashboardCache = new Map<string, TextChannel | null>();

  getAutoRole(guildId: string): string | null {
    return this.autoRoles.get(guildId) ?? null;
  }

  private async findDashboardChannel(guild: Guild): Promise<TextChannel | null> {
    const cached = this.dashboardCache.get(guild.id);
    if (cached !== undefined) return cached;

    const channels = guild.channels.cache.filter(
      (ch): ch is TextChannel =>
        "topic" in ch && typeof ch.topic === "string" &&
        ch.topic.includes(DASHBOARD_TOPIC)
    );
    const dashboard = channels.first() as TextChannel | undefined ?? null;

    this.dashboardCache.set(guild.id, dashboard);
    return dashboard;
  }

  private getRoleIdFromTopic(topic: string): string | null {
    const idx = topic.indexOf(AUTO_ROLE_TOPIC_MARKER);
    if (idx === -1) return null;
    return topic.slice(idx + AUTO_ROLE_TOPIC_MARKER.length).trim() || null;
  }

  private removeAutoRoleFromTopic(topic: string): string {
    const marker = AUTO_ROLE_TOPIC_MARKER;
    const idx = topic.indexOf(marker);
    if (idx === -1) return topic;

    const prefix = "auto-role";
    const start = topic.lastIndexOf(prefix, idx);
    if (start === -1) return topic.slice(0, idx).trimEnd();

    return topic.slice(0, Math.max(0, start - 1)).trimEnd();
  }

  private async updateTopic(dashboard: TextChannel, newTopic: string, action: string): Promise<void> {
    const start = Date.now();

    if (dashboard.topic === newTopic) {
      logger.info(`Skipped redundant setTopic for guild ${dashboard.guild.id} (${action})`);
      return;
    }

    try {
      await dashboard.setTopic(newTopic);
    } catch (err) {
      logger.error(`Failed to ${action} auto-role topic for guild ${dashboard.guild.id}`, { error: String(err) });
      throw err;
    }

    const elapsed = Date.now() - start;
    if (elapsed > 500) {
      logger.warn(`Slow setTopic for guild ${dashboard.guild.id} (${action}): ${elapsed}ms`);
    }
  }

  setAutoRole(guild: Guild, roleId: string): Promise<void> {
    this.autoRoles.set(guild.id, roleId);
    return this.persistAutoRole(guild, roleId);
  }

  removeAutoRole(guild: Guild): Promise<void> {
    this.autoRoles.set(guild.id, null);
    return this.clearAutoRoleFromTopic(guild);
  }

  private async persistAutoRole(guild: Guild, roleId: string): Promise<void> {
    try {
      const dashboard = await this.findDashboardChannel(guild);
      if (!dashboard) {
        logger.warn(`Cannot persist auto-role for guild ${guild.id}: no dashboard found`);
        return;
      }
      let topic = dashboard.topic ?? "";
      topic = this.removeAutoRoleFromTopic(topic);
      topic = `${topic} ${getAutoRoleTopic(roleId)}`.trimStart();
      await this.updateTopic(dashboard, topic, "persist");
    } catch (err) {
      logger.error(`Failed to persist auto-role for guild ${guild.id}`, { error: String(err) });
    }
  }

  private async clearAutoRoleFromTopic(guild: Guild): Promise<void> {
    try {
      const dashboard = await this.findDashboardChannel(guild);
      if (!dashboard) return;
      let topic = dashboard.topic ?? "";
      topic = this.removeAutoRoleFromTopic(topic);
      await this.updateTopic(dashboard, topic.trim(), "clear");
    } catch (err) {
      logger.error(`Failed to clear auto-role topic for guild ${guild.id}`, { error: String(err) });
    }
  }

  async recoverFromGuilds(client: Client): Promise<void> {
    let i = 0;
    for (const guild of client.guilds.cache.values()) {
      if (i > 0) await new Promise((r) => setTimeout(r, 1000));
      i++;
      try {
        const dashboard = await this.findDashboardChannel(guild);
        if (!dashboard || !dashboard.topic) continue;

        const roleId = this.getRoleIdFromTopic(dashboard.topic);
        if (!roleId) continue;

        const role = guild.roles.cache.get(roleId);
        if (role) {
          this.autoRoles.set(guild.id, roleId);
          logger.info(`Recovered auto-role for guild ${guild.id}: role ${roleId}`);
        } else {
          let topic = dashboard.topic;
          topic = this.removeAutoRoleFromTopic(topic);
          await dashboard.setTopic(topic.trim()).catch(() => null);
          this.autoRoles.set(guild.id, null);
          logger.warn(`Auto-role ${roleId} not found in guild ${guild.id}, cleaning up`);
        }
      } catch (error) {
        logger.error(`Failed to recover auto-role for guild ${guild.id}`, error as Record<string, unknown>);
      }
    }
  }

  clearGuild(guildId: string): void {
    this.autoRoles.set(guildId, null);
    this.dashboardCache.delete(guildId);
  }
}

export const autoRoleManager = new AutoRoleManager();
