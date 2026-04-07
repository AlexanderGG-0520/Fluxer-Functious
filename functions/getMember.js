async function getMember(guild, query) {
  if (!query) return null;
  
  const isIdQuery = /^\d{17,19}$/.test(query);
  const mentionMatch = query.match(/^<@!?(\d+)>$/);
  const targetId = mentionMatch ? mentionMatch[1] : isIdQuery ? query : null;
  
  if (targetId) {
    const cachedMember = guild.members.get(targetId);
    if (cachedMember) return cachedMember;
  }
  
  const byDisplayName = guild.members.find(m => m.displayName?.toLowerCase() === query.toLowerCase());
  if (byDisplayName) return byDisplayName;
  
  const byUsername = guild.members.find(m => m.user?.username?.toLowerCase() === query.toLowerCase());
  if (byUsername) return byUsername;
  
  const partialDisplay = guild.members.find(m => m.displayName?.toLowerCase().includes(query.toLowerCase()));
  if (partialDisplay) return partialDisplay;
  
  const partialUsername = guild.members.find(m => m.user?.username?.toLowerCase().includes(query.toLowerCase()));
  if (partialUsername) return partialUsername;
  
  if (targetId) {
    const fetchedMember = await guild.fetchMember(targetId).catch(() => null);
    if (fetchedMember) return fetchedMember;
    
    const fetchedUser = await guild.client.users.fetch(targetId).catch(() => null);
    if (fetchedUser) return { user: fetchedUser, id: fetchedUser.id, displayName: fetchedUser.username, userNotInGuild: true };
  }
  
  return null;
}

module.exports = getMember;
