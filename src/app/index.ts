import { event } from "event";
import { env } from "config/env";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({ intents: [
  GatewayIntentBits.AutoModerationConfiguration,
  GatewayIntentBits.AutoModerationExecution,
  GatewayIntentBits.DirectMessageReactions,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildScheduledEvents,
  GatewayIntentBits.DirectMessageTyping,
  GatewayIntentBits.DirectMessagePolls,
  GatewayIntentBits.GuildMessageTyping,
  GatewayIntentBits.GuildIntegrations,
  GatewayIntentBits.GuildMessagePolls,
  GatewayIntentBits.GuildExpressions,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildModeration,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildWebhooks,
  GatewayIntentBits.GuildInvites,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.Guilds,
]});

event.loadEvents(client);

client.login(env.BOT_TOKEN).catch((err) => {
  console.error("Error logging in to Discord:", err);
});