# Terraswap bLuna-Luna rate monitor
Telegram bot for Terra tokens swap rate monitoring with automated notifications

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
1. `help` (list all commands available)
2. `swap [assetA] [assetB]` (get rate for assetA-assetB pair) Example: /swap spec ust
3. `autoswap [assetA] [assetB] [swaprate_higher_than] [swaprate_lower_than]` (enable automatically checks for the assetA-assetB swap rate - bot will send notifications every time the swap rate is over [swaprate_higher_than] or under [swaprate_lower_than])  Example: /autoswap lota ust 1.15 1.02
4. `autoswap [assetA] [assetB]` (turns on/off auto monitor for an already added pair) Example: /autoswap lota ust
5. `query_frequency [frequency in ms]` (configure frequency of the bot to monitor swap rate - **Default value: 5 mins**) - Example: /query_frequency 360000 - which means every 5 minutes
6. `swaprate_higherthan [assetA] [assetB] [rate]` (bot will send notifications every time the swap rate is higher than the amount defined based on the query frequency for assetA-assetB pair) Example: /swaprate_higherthan lota ust 1.15
7. `swaprate_lowerthan [assetA] [assetB] [rate]` (bot will send notifications every time the swap rate is lower than the amount defined based on the query frequency for assetA-assetB pair) - Example: /swaprate_lowerthan lota ust 1.02
8. `list_auto` (returns a list with all the current pairs with swap rate auto-monitoring enabled)

## Buy me a coffee
Did you liked the bot? Send a tip! =) 
Terra wallet `terra1exw8kvva3s7yqjkeakunagmnjc2r95h0w2ekvy`
