import { event } from "event";
import { env } from "config/env";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({ intents: [
  GatewayIntentBits.Guilds
]});

event.loadEvents(client);

client.login(env.BOT_TOKEN).catch((err) => {
  console.error("Error logging in to Discord:", err);
});