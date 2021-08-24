const { getPairsByNameAndContract } = require('./pairs')
const { nativeTokens } = require('../constants/constants')
let config = require('./configs')
let Terra = config.terra
let timeouts = []
let pairsGlobal = null

const getPairs = async () => {
  if(pairsGlobal == null) {
    try{
      pairsGlobal = await getPairsByNameAndContract()
      return pairsGlobal
    }
    catch (ex) {
      console.log(ex.message)
    }
  }
  return pairsGlobal
}

const clearMonitorQueue = () => {
  for(let i = 0; i < timeouts.length; i++) {
    clearTimeout(timeouts[i])
  }
}

const querySwapRateAndSetTimerForNextQuery = async (ctx, pairAuto) => {
  const terms = ctx.message.text.split(" ")
  const tokenA = terms[1]
  const tokenB = terms[2]

  if(!tokenA || !tokenB){
    return ctx.reply(`Error! /swap requires asset A and asset B as parameters. Example: /swap lota ust`)
  } 

  let pair = pairAuto || await findPair(tokenA, tokenB)

  if(!pairAuto){
    Commands.querySwapRate(ctx, null)
  } else {
    Commands.querySwapRate(ctx, pair)
  }

  timeouts.push(setTimeout(querySwapRateAndSetTimerForNextQuery, config.swapQueryFrequency, ctx, pair))
}

const findPair = async (tokenA, tokenB) => {
  const pairNameAlt1 = `${tokenA}_${tokenB}`
  const pairNameAlt2 = `${tokenB}_${tokenA}`
  const pairs = await getPairs()

  let pair = pairs.find(pair => pair.name == pairNameAlt1.toUpperCase())

  if(!pair){
    pair = pairs.find(pair => pair.name == pairNameAlt2.toUpperCase())
  }

  if(!pair){
    return false
  } else {
    return pair
  }
}

const customQuerySwapRate = async (ctx, pairAuto) => {
  let pair = null
  const terms = ctx.message.text.split(" ")
  const tokenA = terms[1]
  const tokenB = terms[2]
  if(pairAuto){
    pair = pairAuto
  } else {
    if(!tokenA || !tokenB){
      return ctx.reply(`Error! /swap requires asset A and asset B as parameters. Example: /swap lota ust`)
    }

    pair = await findPair(tokenA, tokenB)

    if(!pair){
      return ctx.reply(`Oops! Pair wasn't found! :(`)
    }
  }

  const swapRateHigherThan = terms[3]
  const swapRateLowerThan = terms[4]

  if(ctx.message.text.indexOf('/autoswap') >= 0){
    if(!config.customAutoSwap[pair.name]){
      if(!swapRateHigherThan || !swapRateLowerThan){
        clearMonitorQueue()
        return ctx.reply(`Error: 
Custom autoswap requires 4 parameters: token A, token B, swap rate higher than and swap rate lower than`)  
      }
      config.addAutoSwapConfig(pair.name, {
        isAutoSwapEnabled: true,
        swapRateHigherThan: swapRateHigherThan,
        swapRateLowerThan: swapRateLowerThan
      }) 
      ctx.reply(`Autoswap is ON for pair: ${pair.name}
Swap rate higher than: ${swapRateHigherThan || config.customAutoSwap[pair.name].swapRateHigherThan} 
Swap rate lower than: ${swapRateLowerThan || config.customAutoSwap[pair.name].swapRateLowerThan}`)
    } else {
      if(!pairAuto && !swapRateHigherThan && !swapRateLowerThan){
        const isPairAutoSwapEnabled = config.updatePairAutoSwapConfig(pair.name)
        if(isPairAutoSwapEnabled){
          ctx.reply(`Autoswap is ON for pair: ${pair.name}
Swap rate higher than: ${swapRateHigherThan || config.customAutoSwap[pair.name].swapRateHigherThan} 
Swap rate lower than: ${swapRateLowerThan || config.customAutoSwap[pair.name].swapRateLowerThan}`)
        } else {
          // clear timeouts for pair
          for(timeout of timeouts){
            if(timeout._timerArgs.length == 2 && timeout._timerArgs[1] == pair){
              clearTimeout(timeout)
            }
          }
          ctx.reply(`Autoswap is OFF for pair: ${pair.name}`)
        }
      }
      if(!pairAuto && (swapRateHigherThan || swapRateLowerThan)){
        config.updateSwapRateParams(pair.name, {
          swapRateHigherThan,
          swapRateLowerThan
        })
        ctx.reply(`${pair.name} config was updated
Swap rate higher than: ${swapRateHigherThan || config.customAutoSwap[pair.name].swapRateHigherThan} 
Swap rate lower than: ${swapRateLowerThan || config.customAutoSwap[pair.name].swapRateLowerThan}`)
      }
    }
  }
  const poolQueryResults = await Terra.wasm.contractQuery(pair.contractAddress, {"pool": {}})
  let lp = []
  for(asset of poolQueryResults.assets){
    const amount = asset.amount/1000000
    if(asset.info.native_token){
      const token = pair.tokens.find(token => token.name.toUpperCase() == nativeTokens[asset.info.native_token.denom])
      lp.push({ ...token, amount })
    } else {
      const token = pair.tokens.find(token => token.contractAddress == asset.info.token.contract_addr)
      lp.push({ ...token, amount })
    }
  }
  const swapRate = lp[0].amount/lp[1].amount
  const inverseSwapRate = lp[1].amount/lp[0].amount
  if(ctx.message.text.indexOf('/swap') >= 0 || ((swapRate > config.customAutoSwap[pair.name].swapRateHigherThan || swapRate < config.customAutoSwap[pair.name].swapRateLowerThan)) && config.customAutoSwap[pair.name].isAutoSwapEnabled) {
    ctx.replyWithMarkdown(`Swap *1* ${lp[1].name} for *${swapRate.toFixed(4)}* ${lp[0].name}
Swap *1* ${lp[0].name} for *${inverseSwapRate.toFixed(4)}* ${lp[1].name}`)
  }
}

const helpMessage = `Available commands:
- /swap [assetA] [assetB] (get rate for assetA-assetB pair) Example: /swap spec ust
- /autoswap [assetA] [assetB] [swaprate_higher_than] [swaprate_lower_than] (enable automatically checks for the assetA-assetB swap rate - bot will send notifications every time the swap rate is over [swaprate_higher_than] or under [swaprate_lower_than])  Example: /autoswap lota ust 1.15 1.02
- /autoswap [assetA] [assetB] (turns on/off auto monitor for an already added pair) Example: /autoswap lota ust
- /swaprate_higherthan [assetA] [assetB] [rate] (bot will send notifications every time the swap rate is higher than the amount defined based on the query frequency for assetA-assetB pair) Example: /swaprate_higherthan lota ust 1.15
- /swaprate_lowerthan [assetA] [assetB] [rate] (bot will send notifications every time the swap rate is lower than the amount defined based on the query frequency for assetA-assetB pair) - Example: /swaprate_lowerthan lota ust 1.02
- /query_frequency [frequency in ms] (configure frequency of the bot to monitor swap rate - **Default value: 5 mins**) - Example: /query_frequency 360000 - which means every 5 minutes
- /list_auto returns a list with all the current pairs with swap rate auto-monitoring enabled`

const Commands = {
  start: (ctx) => {
      ctx.reply(helpMessage)
  },
  help: (ctx) => {
      ctx.reply(helpMessage)
  },
  querySwapRate: (ctx, pair) => {
    customQuerySwapRate(ctx, pair)
  },
  autoswap: (ctx) => {
    // ctx.message.text
    if(ctx.message.text.split(" ").length > 1){
      querySwapRateAndSetTimerForNextQuery(ctx)
    } else {
      for(conf in config.customAutoSwap){
        conf.isAutoswapEnabled = false
      }
      ctx.reply('AutoSwap is OFF')
    }
  },
  swapRateHigherThan: async (ctx) => {
      const terms = ctx.message.text.split(" ")
      const tokenA = terms[1]
      const tokenB = terms[2]
      const swapRateHigherThan = terms[3]
      const pairNameAlt1 = `${tokenA}_${tokenB}`
      const pairNameAlt2 = `${tokenB}_${tokenA}`
      const pairs = await getPairs()
      let pair = pairs.find(pair => pair.name == pairNameAlt1.toUpperCase())
      if(!pair){
        pair = pairs.find(pair => pair.name == pairNameAlt2.toUpperCase())
      }
      if(!pair){
        return ctx.reply(`Oops! Pair ${pairNameAlt1.toUpperCase()} wasn't found! :(`)
      }
      if(Number.isNaN(swapRateHigherThan)){
        return ctx.reply('Error - This is not a number')
      }
      config.updateSwapRateParams(pair.name, {
        swapRateHigherThan
      })
      ctx.reply(`${pair.name} swapRateHigherThan set to: ${swapRateHigherThan}`)
  },
  swapRateLowerThan: async (ctx) => {
    const terms = ctx.message.text.split(" ")
    const tokenA = terms[1]
    const tokenB = terms[2]
    const swapRateLowerThan = terms[3]
    const pairNameAlt1 = `${tokenA}_${tokenB}`
    const pairNameAlt2 = `${tokenB}_${tokenA}`
    const pairs = await getPairs()
    let pair = pairs.find(pair => pair.name == pairNameAlt1.toUpperCase())
    if(!pair){
      pair = pairs.find(pair => pair.name == pairNameAlt2.toUpperCase())
    }
    if(!pair){
      return ctx.reply(`Oops! Pair ${pairNameAlt1.toUpperCase()} wasn't found! :(`)
    }
    if(Number.isNaN(swapRateLowerThan)){
      return ctx.reply('Error - This is not a number')
    }
    config.updateSwapRateParams(pair.name, {
      swapRateLowerThan
    })
    ctx.reply(`${pair.name} swapRateLowerThan set to: ${swapRateLowerThan}`)
  },
  queryFrequency: (ctx) => {
      const queryFrequency = Number(ctx.message.text.substr(ctx.message.text.indexOf(' ') + 1))
      if(Number.isNaN(queryFrequency)){
        return ctx.reply('Error - This is not a number')
      }
      config.swapQueryFrequency = queryFrequency
      ctx.reply('swapQueryFrequency set to: ' + config.swapQueryFrequency + ' ms')
  },
  listAutoSwapEnabledPairs: (ctx) => {
    if(Object.keys(config.customAutoSwap).length == 0){
      return ctx.reply("No pairs are being monitored") 
    }
    let list = `Auto notifications enabled for pairs:
`
    for(conf in config.customAutoSwap){
      if(config.customAutoSwap[conf].isAutoSwapEnabled){
        list+= `${conf} 
        Swap rate higher than: ${config.customAutoSwap[conf].swapRateHigherThan}
        Swap rate lower than: ${config.customAutoSwap[conf].swapRateLowerThan}
`
      }
    }
    ctx.reply(list)  
  }
}

module.exports = Commands