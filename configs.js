const { LCDClient } = require('@terra-money/terra.js');
const { Telegraf } = require('telegraf')

module.exports = {
    terra: new LCDClient({
        URL: 'https://fcd.terra.dev',
        chainID: 'columbus-4',
    }),
    bot: new Telegraf(process.env.BOT_TOKEN),
    swapQueryFrequency: 360000,
    swapRateHigherThan: 1.15,
    swapRateLowerThan: 1.01,
    isAutoSwapEnabled: false
}