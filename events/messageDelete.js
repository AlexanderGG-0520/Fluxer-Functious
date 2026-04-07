const PollDB = require("../models/polls");
const Giveaways = require("../models/giveaways");
const GuildDB = require("../models/guilds");

module.exports = async (client, msg) => {
  const authorId = msg.author?.id;
  const msgId = msg.id;

  if (authorId && client.paginate?.has(authorId)) {
    client.paginate.delete(authorId);
  }

  if (client.polls?.has(msgId)) {
    client.polls.delete(msgId);
    await PollDB.findOneAndDelete({ messageId: msgId }).catch(() => null);
  }

  await Promise.all([
    Giveaways.findOneAndDelete({ messageId: msgId }).catch(() => null),
    (async () => {
      const guild = await GuildDB.findOne({
        roles: { $elemMatch: { msgId } },
      }).catch(() => null);

      if (guild) {
        guild.roles = guild.roles.filter((r) => r.msgId !== msgId);
        await guild.save().catch(() => null);
      }
    })(),
  ]);
};
