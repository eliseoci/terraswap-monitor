require('dotenv').config()
const Commands = require('./commands')
const { bot } = require('./configs')

bot.start((ctx) => Commands.start(ctx))
bot.help((ctx) => Commands.help(ctx))
bot.command('swap', (ctx) => Commands.querySwapRate(ctx))
bot.command('autoswap', (ctx) => Commands.autoswap(ctx))
bot.command('swaprate_higherthan', (ctx) => Commands.swapRateHigherThan(ctx))
bot.command('swaprate_lowerthan', (ctx) => Commands.swapRateLowerThan(ctx))
bot.command('query_frequency', (ctx) => Commands.queryFrequency(ctx))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))