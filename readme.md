# Terraswap bLuna-Luna rate monitor
======
Telegram bot for bLuna-Luna rate monitoring with automatic notifications

## Pre-requisites
1. Node.js installed
2. Telegram bot token (If you don't have a telegram bot created just go to https://core.telegram.org/bots#3-how-do-i-create-a-bot and follow the steps)

## How to run

### Option A. Local machine
1. Add your telegram bot token to .env.sample file 
2. Rename .env.sample file to .env
2. Run `npm install` or `yarn install`
3. Run `node index.js`

### Option B. Deploy to cloud
1. Add your telegram bot token to .env.sample file 
2. Rename .env.sample file to .env
3. Deploy to cloud

## Commands
1. help (list all commands available)
2. swap (get bluna/luna rate) para obtener el rate bluna/luna del momento
3. autoswap (turns on/off the ability for the bot to automatically check swap rate for you)
4. query_frequency [frequency in ms] (configure frequency of the bot to monitor swap rate - Default value: 5 mins) - Example: /query_frequency 360000 - which means every 5 minutes
5. swaprate_higherthan [rate] (bot will send notifications every time the swap rate is higher than the amount defined based on the query frequency - Default value: 1.15) Example: /swaprate_higherthan 1.15
6. swaprate_lowerthan [rate] (bot will send notifications every time the swap rate is lower than the amount defined based on the query frequency - Default value: 1.01) - Example: /swaprate_lowerthan 1.02