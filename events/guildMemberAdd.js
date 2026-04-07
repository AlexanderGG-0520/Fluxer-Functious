module.exports = async (client, member) => {
  if (member.user.bot) return;
  const db = await client.database.getGuild(member.guild.id);
  if (!db) return;

  if (db.joinRoles?.length > 0) {
    const roleAdds = db.joinRoles.map((roleId) =>
      member.roles.add(roleId).catch(() => null)
    );
    await Promise.all(roleAdds);
  }

  if (db.stickyRolesEnabled) {
    const user = db.stickyRoles.find((r) => r.user === member.user.id);
    if (user?.roles?.length > 0) {
      const roleAdds = user.roles.map((roleId) =>
        member.roles.add(roleId).catch(() => null)
      );
      await Promise.all(roleAdds);

      const newRoles = db.stickyRoles.filter((r) => r.user !== member.user.id);
      await client.database.updateGuild(member.guild.id, { stickyRoles: newRoles });
    }
  }
};