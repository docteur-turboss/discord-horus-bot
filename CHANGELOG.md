# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.1.0] - 2026-03-25

### 🎉 Added

#### 📜 Logging System
- Full logging system for server events
- Message delete logging with content formatting
- Message update logging with before/after diff
- Role create / update / delete logging
- Channel create / update / delete logging
- Moderation logs (ban, mute, unmute)
- Audit log integration to resolve action executor
- Permission diff tracking on role updates
- Log panels with enable / disable system

#### 🌐 Internationalization (Logs)
- Full i18n support for all logs
- Translations for message, role, and moderation events
- Permission translation mapping
- Dynamic field translations

#### 🧱 Architecture & Helpers
- Introduced reusable logging helpers
- Centralized log channel resolvers (by topic system)
- Content formatter for messages
- Permission formatter utility
- Audit log executor helper

### ♻️ Changed

- Refactored all log listeners for consistency
- Unified embed structure via `logEmbed`
- Improved event handling patterns
- Standardized language resolution across listeners
- Reworked channel detection using invisible characters
- Simplified and modularized logging logic

### 🎨 Improved

- Better readability and maintainability of listeners
- Consistent logging UX across all events
- Cleaner separation between logic and presentation
- Scalable structure for future log types

### 🐛 Fixed

- Missing event listeners registration
- Incorrect permission display in logs
- Edge cases with partial messages
- Logging inconsistencies between events

### 🔖 Release

- Version bump from **1.0.0 → 1.1.0**
- Introduces a **major new feature: logging system**

### 📌 Notes

- This release adds a **complete observability layer** to the bot
- Logging system is designed to be extensible
- Foundation laid for future moderation analytics

---

## [1.0.0] - 2026-03-19

### 🎉 Added

#### 🛡️ Moderation Commands
- Ban / Unban system with confirmation workflow
- Kick command with confirmation
- Mute / Unmute (timeout-based)
- Lock / Unlock channel system
- Purge messages command (bulk delete)
- Rename user command
- Reset nickname command

#### 🌐 Internationalization
- Full i18n system (FR / EN)
- Translation keys with variable support
- Typed i18n structure
- Language handling utilities

#### ✅ Confirmation System
- Confirmation buttons for sensitive actions
- Logging system for confirmed moderation actions

#### 🧰 Tooling & Setup
- ESLint configuration
- Commit standards
- Build scripts
- Deploy script
- Environment management with dotenv
- Path aliases support (`tsconfig-paths`)

### ♻️ Changed

- Refactored all commands for consistency and maintainability
- Improved reply system with i18n support
- Simplified response helper logic
- Isolated permission checks and validation logic
- Refactored `BaseCommand` responsibilities
- Updated TypeScript configuration
- Improved embed formatting and responses

### 🎨 Improved

- Cleaner code structure and separation of concerns
- Better naming conventions (`userId` → `channelId`)
- Consistent command architecture
- Improved validation utilities
- Enhanced developer experience

### 🐛 Fixed

- Role hierarchy issues in moderation commands
- Incorrect user mentions in embeds
- Command execution context issues
- Reset nickname variable requirement bug
- Duplicate error handling logic
- Permission checking inconsistencies

### 📌 Notes

- This is the **first stable release** of the project
- Establishes a solid base for future features
- Fully functional moderation system
- Ready for production use
