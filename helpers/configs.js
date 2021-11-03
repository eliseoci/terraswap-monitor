const { LCDClient } = require('@terra-money/terra.js');
const { Telegraf } = require('telegraf')

const updateSwapRateParams = (pairName, swapRates) => {
    if(swapRates.swapRateHigherThan){
        config.customAutoSwap[pairName].swapRateHigherThan = swapRates.swapRateHigherThan
    }
    if(swapRates.swapRateLowerThan){
        config.customAutoSwap[pairName].swapRateLowerThan = swapRates.swapRateLowerThan
    }
}

const addAutoSwapConfig = (pairName, pairConfigs) => {
    config.customAutoSwap[pairName] = pairConfigs
}

const updatePairAutoSwapConfig = (pairName) => {
    if(config.customAutoSwap[pairName]){
        config.customAutoSwap[pairName].isAutoSwapEnabled = !config.customAutoSwap[pairName].isAutoSwapEnabled
        return config.customAutoSwap[pairName].isAutoSwapEnabled
    }
    return false
}

let config = {
    terra: new LCDClient({
        URL: 'https://fcd.terra.dev',
        chainID: 'columbus-5',
    }),
    bot: new Telegraf(process.env.BOT_TOKEN),
    swapQueryFrequency: 10000,
    isAutoSwapEnabled: false,
    customAutoSwap: {},
    addAutoSwapConfig,
    updateSwapRateParams,
    updatePairAutoSwapConfig
}

module.exports = config