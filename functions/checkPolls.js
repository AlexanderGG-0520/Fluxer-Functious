const db = require("../models/polls");
const Polls = require("./poll");

async function checkPolls(client) {
  const polls = await db.find({ ended: false });
  if (!polls?.length) return;

  for (let i = 0; i < polls.length; i++) {
    const poll = polls[i];
    const delay = i * 700;

    setTimeout(async () => {
      try {
        const channel = await client.channels.resolve(poll.channelId);
        if (!channel) return;

        const msg = await channel.messages?.fetch(poll.messageId).catch(() => null);
        if (!msg) return;

        const dueTime = poll.now + poll.time;
        const now = Date.now();

        if (dueTime <= now) {
          await db.findOneAndUpdate({ messageId: poll.messageId }, { ended: true });
          const newPoll = new Polls({
            time: 0,
            client,
            name: { name: poll.name, description: poll.desc },
            options: poll.options,
            votes: poll.votes,
            users: poll.users,
            avatars: poll.avatars,
            owner: poll.owner,
            lang: poll.lang,
          });
          await newPoll.update();

          let tooMuch = [];
          if (poll.desc?.length > 80) tooMuch.push(`**${client.translate.get(poll.lang, "Events.messageReactionRemove.title")}**: ${poll.desc}`)
          poll.options?.name?.filter(e => e).forEach((e, i) => {
            i++
            if (e.length > 70) {
              tooMuch.push(`**${i}.** ${e}`)
            }
          });

          const pollImage = await fetch(`${process.env.CDN}/api/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apikey: process.env.CDN_KEY,
              image: newPoll.canvas.toDataURL('image/png'),
              timeframe: 0,
              messageId: poll.messageId,
              last: true
            })
          }).then((i) => i.json()).catch(() => null);

          if (pollImage?.url) {
            await msg.edit({
              embeds: [{
                setDescription: () => `${client.translate.get(poll.lang, "Functions.poll.end")}${tooMuch.length > 0 ? `\n\n${tooMuch.map(e => e).join("\n")}` : ""}\n_ _`,
                setImage: () => `${process.env.CDN}${pollImage.url}`,
                setColor: () => `#A52F05`,
              }]
            });
          }
          await msg.reactions?.removeAll().catch(() => { });
          return;
        }

        await db.deleteOne({ messageId: poll.messageId });

        const newPoll = new Polls({
          time: poll.time,
          client,
          name: { name: poll.name, description: poll.desc },
          options: poll.options,
          votes: poll.votes,
          users: poll.users,
          avatars: poll.avatars,
          owner: poll.owner,
          lang: poll.lang,
        });

        newPoll.start(msg, newPoll);
      } catch { }
    }, delay);
  }
}

module.exports = checkPolls;
