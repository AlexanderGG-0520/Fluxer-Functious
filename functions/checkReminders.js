const db = require("../models/users");

const MAX_TIMEOUT = 2147483647;

function formatTimeWithTimezone(timestamp) {
    return `<t:${timestamp}:f>`;
}

function safeTimeout(callback, delay) {
  if (delay <= MAX_TIMEOUT) {
    return setTimeout(callback, delay);
  }

  const remaining = delay - MAX_TIMEOUT;
  return setTimeout(() => safeTimeout(callback, remaining), MAX_TIMEOUT);
}

async function sendGuildReminderWithRetry(client, channelId, userId, message, createdAt, maxRetries = 3) {
    const timestampText = formatTimeWithTimezone(createdAt);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                await channel.send(`<@${userId}>, reminder from ${timestampText}: ${message}`);
                return { success: true };
            }
        } catch (err) {
            if (attempt === maxRetries) {
                return { success: false, error: err };
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    return { success: false };
}

async function sendDMReminderWithRetry(client, userId, message, createdAt, maxRetries = 3) {
    const timestampText = formatTimeWithTimezone(createdAt);
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const user = await client.users.fetch(userId);
            if (user) {
                await user.createDM().then((u) => u.send(`<@${userId}>, reminder from ${timestampText}: ${message}`));
                return { success: true };
            }
        } catch (err) {
            if (attempt === maxRetries) {
                return { success: false, error: err };
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
    return { success: false };
}

async function scheduleGuildReminder(client, userId, reminderId, timestamp, message, channelId, createdAt) {
    const now = Date.now();
    const timeUntil = timestamp * 1000 - now;
    if (timeUntil <= 0) return;

    safeTimeout(async () => {
        await sendGuildReminderWithRetry(client, channelId, userId, message, createdAt);
        try {
            const userData = await client.database.getUser(userId, false);
            if (userData) {
                const updatedReminders = (userData.reminders || []).filter(r => r.id !== reminderId);
                await client.database.updateUser(userId, { reminders: updatedReminders }, true);
            }
        } catch (err) {
        }
    }, timeUntil);
}

async function scheduleDMReminder(client, userId, reminderId, timestamp, message, createdAt) {
    const now = Date.now();
    const timeUntil = timestamp * 1000 - now;
    if (timeUntil <= 0) return;

    safeTimeout(async () => {
        await sendDMReminderWithRetry(client, userId, message, createdAt);
        try {
            const userData = await client.database.getUser(userId, false);
            if (userData) {
                const updatedReminders = (userData.reminders || []).filter(r => r.id !== reminderId);
                await client.database.updateUser(userId, { reminders: updatedReminders }, true);
            }
        } catch (err) {
        }
    }, timeUntil);
}

async function checkReminders(client) {
    const usersWithReminders = await db.find({ "reminders.0": { $exists: true } });
    if (!usersWithReminders?.length) return;

    const now = Date.now();

    for (const userData of usersWithReminders) {
        const userId = userData.userId;

        for (const reminder of userData.reminders) {
            const timeUntil = reminder.timestamp * 1000 - now;
            
            if (timeUntil <= 0) {
                if (reminder.type === "guild") {
                    await sendGuildReminderWithRetry(client, reminder.channelId, userId, reminder.message, reminder.createdAt);
                } else {
                    await sendDMReminderWithRetry(client, userId, reminder.message, reminder.createdAt);
                }
                try {
                    const updatedReminders = (userData.reminders || []).filter(r => r.id !== reminder.id);
                    await client.database.updateUser(userId, { reminders: updatedReminders }, true);
                } catch (err) {
                }
                continue;
            }

            safeTimeout(async () => {
                if (reminder.type === "guild") {
                    await sendGuildReminderWithRetry(client, reminder.channelId, userId, reminder.message, reminder.createdAt);
                } else {
                    await sendDMReminderWithRetry(client, userId, reminder.message, reminder.createdAt);
                }
                
                try {
                    const currentUserData = await client.database.getUser(userId, false);
                    if (currentUserData) {
                        const updatedReminders = (currentUserData.reminders || []).filter(r => r.id !== reminder.id);
                        await client.database.updateUser(userId, { reminders: updatedReminders }, true);
                    }
                } catch (err) {
                }
            }, timeUntil);
        }
    }
}

module.exports = { checkReminders, sendGuildReminderWithRetry, sendDMReminderWithRetry, scheduleGuildReminder, scheduleDMReminder };
