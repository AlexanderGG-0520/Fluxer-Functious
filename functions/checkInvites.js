const db = require("../models/guilds");

async function checkInvites(client) {
  const guilds = await db.find({ getInvites: true });
  const results = [];

  for (const guild of guilds) {
    if (guild.invites?.length > 0) continue;

    const fetchedInvites = await client.rest.get(`/guilds/${guild.id}/invites`);
    const invites = fetchedInvites.map((invite) => ({
      code: invite.code,
      uses: invite.uses,
      inviter: invite.inviter,
    }));

    results.push({ guildId: guild.id, invites });
    client.invites.set(guild.id, invites);
    //await db.updateOne({ id: guild.id }, { invites });
  }

  return results;
}

module.exports = checkInvites;
