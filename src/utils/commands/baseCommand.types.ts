export type BaseCommandType =
  | "ban"
  | "kick"
  | "mute"
  | "unban"
  | "unmute"
  | "lock-channel"
  | "purge-message"
  | "rename-member"
  | "unlock-channel"
  | "set-slow-mode"
  | "remove-slow-mode"
  | "modify-slow-mode"
  | "reset-member-nickname";