const { EmbedBuilder } = require("@erinjs/core");
const Giveaway = require("../models/giveaways");
const Polls = require("../models/polls");
const { dependencies } = require("../package.json");
module.exports = {
  config: {
    name: "info",
    usage: false,
    cooldown: 15000,
    available: true,
    permissions: {},
    aliases: ["stats", "botinfo", "bi"],
  },
  run: async (client, message, args, db) => {
    function memory() {
      const used = process.memoryUsage().heapUsed;
      return Number((used / 1048576).toFixed(2));
    }
    
    const unixstamp = client.functions.get("fetchTime")(
      Math.floor(process.uptime() * 1000),
      client,
      db.language,
      true
    );

    async function Database() {
      let beforeCall = Date.now();
      const pollCount = await Polls.countDocuments();
      return { ping: Date.now() - beforeCall, pollCount };
    }

    async function botPing() {
      try {
        const start = Date.now();
        await client.rest.get("/gateway/bot");
        return Date.now() - start;
      } catch {
        return "502 bad Gateway";
      }
    }

    const dbPing = await Database();
    const gatewayPing = await botPing();
    const giveawayCount = await Giveaway.countDocuments();
    
    const embed = new EmbedBuilder()
      .setDescription(
        `**${client.translate.get(db.language, "Commands.info.start")}**\n${client.translate.get(db.language, "Commands.info.servers")}: \`${client.guilds.size.toLocaleString()}\`\n${client.translate.get(db.language, "Commands.info.giveaways")}: \`${giveawayCount.toLocaleString()}\`\n${client.translate.get(db.language, "Commands.info.polls")}: \`${dbPing.pollCount.toLocaleString()}\`\n${client.translate.get(db.language, "Commands.info.uptime")}: \`${unixstamp}\`\n\n${client.translate.get(db.language, "Commands.info.ping")}: \`${!isNaN(gatewayPing) ? `${gatewayPing}ms` : "502 Bad Gateway"}\`\n${client.translate.get(db.language, "Commands.info.memory")}: \`${memory()}mb\`\n${client.translate.get(db.language, "Commands.info.database")}: \`${dbPing.ping}ms\`\n${client.translate.get(db.language, "Commands.info.library")}: [Erin.js](https://erin.js.org) | ${dependencies["@erinjs/core"]}\n\n${client.translate.get(db.language, "Commands.info.links")}\n[${client.translate.get(db.language, "Commands.info.links2")}](https://web.fluxer.app/oauth2/authorize?client_id=1475548817821799084&scope=bot&permissions=13510799704222800) | [${client.translate.get(db.language, "Commands.info.links3")}](https://fluxer.gg/YnINU09E) | [GitHub](https://github.com/forgetfulskybro/Fluxer-Functious) | [Crowdin](https://crowdin.com/project/functious)`,
      )
      .setColor(`#A52F05`);

    message.reply({ embeds: [embed], mentions: false });
  },
};
