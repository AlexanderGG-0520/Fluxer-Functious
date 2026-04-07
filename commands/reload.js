const Reload = require("../functions/reload")
module.exports = {
    config: {
        name: "reload",
        cooldown: 0,
        available: "Owner",
        permissions: {},
        aliases: ["r"]
    },
    run: async (client, message, args) => {     
        if (!client.config.owners.includes(message.author.id)) return;
        if (!args[0]) return message.reply("Provide either a category, command, event, function, 'languages', or 'reactionHandlers' to reload.", false)
        if (args[0] === "languages") {
            return message.reply(Reload(client, "languages"), false)
        }
        if (args[0] === "reactionHandlers") {
            if (!args[1]) return message.reply("Provide a reaction handler file name to reload.", false)
            return message.reply(Reload(client, "reactionHandlers", args[1]), false)
        }
        message.reply(Reload(client, args[0], args[1], args[2]), false)
    }
}