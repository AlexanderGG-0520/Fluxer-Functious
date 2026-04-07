module.exports = async (client, member) => {
  if (member.user.bot) return;
  const db = await client.database.getGuild(member.guild.id);
  if (!db?.stickyRolesEnabled) return;

  const roleIds = member.roles.roleIds?.map((r) => r.id) || [];
  if (roleIds.length === 0) return;

  const stickyRoles = [
    ...db.stickyRoles.filter((s) => s.user !== member.user.id),
    { user: member.user.id, roles: roleIds },
  ];

  await client.database.updateGuild(member.guild.id, { stickyRoles });
};