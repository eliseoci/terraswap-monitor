const { LCDClient, Coin } = require('@terra-money/terra.js');
const { Telegraf } = require('telegraf')

const BOT_TOKEN = "1726741197:AAFcVDl0NCO1QIflfldagjl2_fmhV-5YiUw"
const bot = new Telegraf(BOT_TOKEN)
let config = {
  swapQueryFrequency: 360000,
  swapRateHigherThan: 1.10,
  swapRateLowerThan: 1.035,
  isAutoSwapEnabled: false
}
let timeouts = []

const querySwapRate = async (ctx) => {
  try {
    const blunaContractAddress = "terra1jxazgm67et0ce260kvrpfv50acuushpjsz2y0p"
    const poolQueryResults = await terra.wasm.contractQuery(blunaContractAddress, {"pool": {}})
    let bLunaAmount = 0;
    let lunaAmount = 0;
    
    poolQueryResults.assets.map(asset => {
      const amount = asset.amount/1000000
      if(asset.info.native_token){
        lunaAmount = amount
      } else {
        bLunaAmount = amount
      }
    })

    const swapRate = bLunaAmount/lunaAmount
    if((swapRate > config.swapRateHigherThan || swapRate < config.swapRateLowerThan) || ctx.message.text == '/swap'){
      const simulationQueryResults = await terra.wasm.contractQuery(blunaContractAddress, {"simulation":{"offer_asset":{"amount":"500000000","info":{"native_token":{"denom":"uluna"}}}}})
      const tradingFee = (simulationQueryResults.commission_amount / 1000000).toFixed(3)
      const lunaToBeReceived = (simulationQueryResults.return_amount / 1000000).toFixed(3)
      const minLunaToBeReceived = ((simulationQueryResults.return_amount/10 - simulationQueryResults.spread_amount) / 100000).toFixed(3)
      
      ctx.replyWithMarkdown(`Swap rate bLuna/Luna: *${swapRate.toFixed(4)}*
      
*### Sample TX - 500 LUNA to bLUNA ###*
      
bLUNA to be received: *${lunaToBeReceived}*
Minimum bLUNA to be received: *${minLunaToBeReceived}*
Trading fee: *${tradingFee} bLUNA*`)
    }

  } catch (ex) {
    ctx.reply('Oops! Something went wrong')
    console.log(ex)
  }
}

const autoSwap = (ctx) => {
  querySwapRate(ctx)
  timeouts.push(setTimeout(autoSwap, config.swapQueryFrequency, ctx))
}
bot.start((ctx) => {
  ctx.reply(`Hola! Puedes utilizar los siguientes comandos:
  - /swap para obtener el rate bluna/luna del momento
  - /autoswap encender/apagar la funcionalidad para que el bot chequee automaticamente el swap rate
  - /swaprate_higherthan [rate] para el bot envie notificaciones de alertas por arriba del swap rate bluna/luna definido (Ejemplo: /swaprate_higherthan 1.15)
  - /swaprate_lowerthan [rate] para que el bot envie notificaciones de alertas por debajo del swap rate bluna/luna definido (Ejemplo: /swaprate_lowerthan 1.02)
  - /query_frequency [frequency in ms] para configurar la frecuencia de chequeo del swap rate bluna/luna (Ejemplo: /query_frequency 360000 - es decir, 5 minutos)`)
})
bot.help((ctx) => {
  ctx.reply(`Hola! Puedes utilizar los siguientes comandos:
  - /swap para obtener el rate bluna/luna del momento
  - /autoswap encender/apagar la funcionalidad para que el bot chequee automaticamente el swap rate
  - /swaprate_higherthan [rate] para el bot envie notificaciones de alertas por arriba del swap rate bluna/luna definido (Ejemplo: /swaprate_higherthan 1.15)
  - /swaprate_lowerthan [rate] para que el bot envie notificaciones de alertas por debajo del swap rate bluna/luna definido (Ejemplo: /swaprate_lowerthan 1.02)
  - /query_frequency [frequency in ms] para configurar la frecuencia de chequeo del swap rate bluna/luna (Ejemplo: /query_frequency 360000 - es decir, 5 minutos)`)
})
bot.command('swap', (ctx) => querySwapRate(ctx))
bot.command('autoswap', (ctx) => {
  config.isAutoSwapEnabled = !config.isAutoSwapEnabled
  if(config.isAutoSwapEnabled){
    ctx.reply('AutoSwap is ON')
    autoSwap(ctx)
  } else {
    ctx.reply('AutoSwap is OFF')
    for(let i = 0; i < timeouts.length; i++) {
      clearTimeout(timeouts[i])
    }
  }
})
bot.command('swaprate_higherthan', (ctx) => {
    const swapRateHigherThan = Number(ctx.message.text.substr(ctx.message.text.indexOf(' ') + 1))
    if(Number.isNaN(swapRateHigherThan)){
      return ctx.reply('Error - This is not a number')
    }
    config.swapRateHigherThan = swapRateHigherThan
    ctx.reply('swapRateHigherThan set to: ' + swapRateHigherThan)
})
bot.command('swaprate_lowerthan', (ctx) => {
  const swapRateLowerThan = Number(ctx.message.text.substr(ctx.message.text.indexOf(' ') + 1))
  if(Number.isNaN(swapRateLowerThan)){
    return ctx.reply('Error - This is not a number')
  }
  config.swapRateLowerThan = swapRateLowerThan
  ctx.reply('swapRateLowerThan set to: ' + swapRateLowerThan)
})
bot.command('query_frequency', (ctx) => {
  const queryFrequency = Number(ctx.message.text.substr(ctx.message.text.indexOf(' ') + 1))
  if(Number.isNaN(queryFrequency)){
    return ctx.reply('Error - This is not a number')
  }
  config.swapQueryFrequency = queryFrequency
  ctx.reply('swapQueryFrequency set to: ' + config.swapQueryFrequency)
})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

const terra = new LCDClient({
    URL: 'https://fcd.terra.dev',
    chainID: 'columbus-4',
  });