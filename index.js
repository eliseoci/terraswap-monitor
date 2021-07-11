require('dotenv').config()
const Commands = require('./helpers/commands')
const { bot } = require('./helpers/configs')

bot.start((ctx) => Commands.start(ctx))
bot.help((ctx) => Commands.help(ctx))
bot.command('swap', (ctx) => Commands.querySwapRate(ctx))
bot.command('autoswap', (ctx) => Commands.autoswap(ctx))
bot.command('swaprate_higherthan', (ctx) => Commands.swapRateHigherThan(ctx))
bot.command('swaprate_lowerthan', (ctx) => Commands.swapRateLowerThan(ctx))
bot.command('query_frequency', (ctx) => Commands.queryFrequency(ctx))
bot.command('list_auto', (ctx) => Commands.listAutoSwapEnabledPairs(ctx))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))