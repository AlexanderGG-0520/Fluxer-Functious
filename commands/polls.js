const { EmbedBuilder, MessageFlags } = require("@erinjs/core");
const Polls = require(`../functions/poll`)
const dhms = require(`../functions/dhms`);
const PollDB = require("../models/polls");
const Paginator = require(`../functions/pagination`);

module.exports = {
    config: {
        name: `polls`,
        usage: true,
        cooldown: 7000,
        available: true,
        permissions: [],
        aliases: ["poll"]
    },
    run: async (client, message, args, db) => {
      // const subcommand = args[0]?.toLowerCase();

      // if (subcommand === "view") {
      //   const option = args[1]?.toLowerCase() || "user";

      //   if (option === "server") {
      //     const polls = await PollDB.find({ serverId: message.guild.id });
      //     if (polls.length === 0) {
      //       return message.reply({
      //         embeds: [new EmbedBuilder()
      //           .setDescription(client.translate.get(db.language, "Commands.polls.noServerPolls") || "No polls found in this server.")
      //           .setColor(`#FF0000`)]
      //       });
      //     }

      //     const chunkSize = 3;
      //     const chunks = [];
      //     for (let i = 0; i < polls.length; i += chunkSize) {
      //       chunks.push(polls.slice(i, i + chunkSize));
      //     }

      //     const embeds = chunks.map((chunk, pageIndex) => {
      //       const embed = new EmbedBuilder()
      //         .setTitle(`${client.translate.get(db.language, "Commands.polls.polls") || "Polls"} - ${client.translate.get(db.language, "Commands.polls.server") || "Server"}`)
      //         .setColor(`#A52F05`);

      //       chunk.forEach((poll, index) => {
      //         embed.addFields({
      //           name: `${client.translate.get(db.language, "Commands.polls.poll") || "Poll"} ${pageIndex * chunkSize + index + 1}: ${poll.desc || "No description"}`,
      //           value: `Owner: <@${poll.owner}> | Channel: <#${poll.channelId}>`,
      //           inline: false
      //         });
      //       });

      //       return embed;
      //     });

      //     if (embeds.length === 1) {
      //       return message.reply({ embeds });
      //     }

      //     const paginator = new Paginator({
      //       user: message.author.id,
      //       client: client,
      //       timeout: 60000
      //     });

      //     embeds.forEach(embed => paginator.add(embed));
      //     return paginator.start(message.channel);
      //   }

      //   const polls = await PollDB.find({ owner: message.author.id });
      //   if (polls.length === 0) {
      //     return message.reply({
      //       embeds: [new EmbedBuilder()
      //         .setDescription(client.translate.get(db.language, "Commands.polls.noUserPolls") || "You have no active polls.")
      //         .setColor(`#FF0000`)]
      //     });
      //   }

      //   const chunkSize = 3;
      //   const chunks = [];
      //   for (let i = 0; i < polls.length; i += chunkSize) {
      //     chunks.push(polls.slice(i, i + chunkSize));
      //   }

      //   const embeds = chunks.map((chunk, pageIndex) => {
      //     const embed = new EmbedBuilder()
      //       .setTitle(`${client.translate.get(db.language, "Commands.polls.polls") || "Polls"} - ${client.translate.get(db.language, "Commands.polls.user") || "User"}`)
      //       .setColor(`#A52F05`);

      //     chunk.forEach((poll, index) => {
      //       console.log(poll)
      //       embed.addFields({
      //         name: `${client.translate.get(db.language, "Commands.polls.poll") || "Poll"} ${pageIndex * chunkSize + index + 1}: ${poll.desc || "No description"}`,
      //         value: `Server: ${poll.serverId ? `<@${poll.serverId}>` : "Unknown"} | Channel: ${poll.channelId ? `<#${poll.channelId}>` : "Unknown"}`,
      //         inline: false
      //       });
      //     });

      //     return embed;
      //   });

      //   if (embeds.length === 1) {
      //     return message.reply({ embeds });
      //   }

      //   const paginator = new Paginator({
      //     user: message.author.id,
      //     client: client,
      //     timeout: 60000
      //   });

      //   embeds.forEach(embed => paginator.add(embed));
      //   return paginator.start(message.channel);
      // }

      const check = await PollDB.find({ owner: message.author.id })
      if (check.length === 5) return message.reply({ embeds: [new EmbedBuilder().setDescription(client.translate.get(db.language, "Commands.polls.tooMany")).setColor(`#FF0000`)] });
      const options = args.join(` `).split(`|`).map(x => x.trim()).filter(x => x);
      if (!options[0]) return message.reply({ embeds: [new EmbedBuilder().setDescription(`${client.translate.get(db.language, "Commands.polls.validTime")}: \`${db.prefix}polls 5m | ${client.translate.get(db.language, "Commands.polls.example")}\``).setColor(`#FF0000`)] });
      const time = dhms(options[0]);
      if (!time) return message.reply({ embeds: [new EmbedBuilder().setDescription(`${client.translate.get(db.language, "Commands.polls.validTime")}: \`${db.prefix}polls 5m | ${client.translate.get(db.language, "Commands.polls.example")}\``).setColor(`#FF0000`)] });
      if (time === 0) return message.reply({ embeds: [new EmbedBuilder().setDescription(`${client.translate.get(db.language, "Commands.polls.validTime")}: \`${db.prefix}polls 5m | ${client.translate.get(db.language, "Commands.polls.example")}\``).setColor(`#FF0000`)] });
      if (time < 30000) return message.reply({ embeds: [new EmbedBuilder().setDescription(`${client.translate.get(db.language, "Commands.polls.longerThan")} \`${db.prefix}polls 5m | ${client.translate.get(db.language, "Commands.polls.example")}\``).setColor(`#FF0000`)] });
      if (time > 2592000000) return message.reply({ embeds: [new EmbedBuilder().setDescription(`${client.translate.get(db.language, "Commands.polls.shorterThan")}: \`${db.prefix}polls 5m | ${client.translate.get(db.language, "Commands.polls.example")}\``).setColor(`#FF0000`)] });
      if (!options[1]) return message.reply({ embeds: [new EmbedBuilder().setDescription(`${client.translate.get(db.language, "Commands.polls.validQuestion")}: \`${db.prefix}polls 5m | ${client.translate.get(db.language, "Commands.polls.example")}\``).setColor(`#FF0000`)] });
      if (!options[2]) return message.reply({ embeds: [new EmbedBuilder().setDescription(`${client.translate.get(db.language, "Commands.polls.validOption")}: \`${db.prefix}polls 5m | ${client.translate.get(db.language, "Commands.polls.example")}\``).setColor(`#FF0000`)] });
      if (!options[3]) return message.reply({ embeds: [new EmbedBuilder().setDescription(`${client.translate.get(db.language, "Commands.polls.validOption2")}: \`${db.prefix}polls 5m | ${client.translate.get(db.language, "Commands.polls.example")}\``).setColor(`#FF0000`)] });
      if (options.length >= 13) return message.reply({ embeds: [new EmbedBuilder().setDescription(`${client.translate.get(db.language, "Commands.polls.maxOptions")}: \`${db.prefix}polls 5m | ${client.translate.get(db.language, "Commands.polls.example")}\``).setColor(`#FF0000`)] });

      const names = [options[2], options[3], options[4] ? options[4] : null, options[5] ? options[5] : null, options[6] ? options[6] : null, options[7] ? options[7] : null, options[8] ? options[8] : null, options[9] ? options[9] : null, options[10] ? options[10] : null, options[11] ? options[11] : null];
      const reactions = [client.config.emojis.one, client.config.emojis.two, options[4] ? client.config.emojis.three : null, options[5] ? client.config.emojis.four : null, options[6] ? client.config.emojis.five : null, options[7] ? client.config.emojis.six : null, options[8] ? client.config.emojis.seven : null, options[9] ? client.config.emojis.eight : null, options[10] ? client.config.emojis.nine : null, options[11] ? client.config.emojis.ten : null, client.config.emojis.stop];

      const poll = new Polls({
        time,
        client,
        name: {
          name: client.translate.get(db.language, "Commands.polls.polls"),
          description: options[1]
        },
        options: {
          name: names.filter(a => a)
        },
        owner: message.author.id, lang: db.language
      })
      await poll.update();

      let tooMuch = [];
      if (options[1].length > 75) tooMuch.push(`**${client.translate.get(db.language, "Commands.polls.title")}**: ${options[1]}`)
      names.filter(e => e).forEach((e, i) => {
        i++
        if (e.length > 70) {
          tooMuch.push(`**${i}.** ${e}`)
        }
      });
      
      await message.channel.send({
        embeds: [new EmbedBuilder().setDescription(`${client.translate.get(db.language, "Commands.polls.loading")}...`).setColor(`#A52F05`)],
      }).then(async (msg) => {
        for (const reaction of reactions) {
          await msg.react(reaction).catch(() => {});
        }
        
        await poll.start(msg, poll, { tooMuch });
        await message.delete().catch(() => { });
        });
    },
};
