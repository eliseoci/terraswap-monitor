const axios = require('axios')
const dummyTokens  = require('../constants/dummy_contracts');
const { nativeTokens } = require('../constants/constants')

const getTokenNameAndAddress = (tokens, token) => {
    if(token.native_token){
        return {
            name: nativeTokens[token.native_token.denom],
            contractAddress: 'native'
        }
    }
    const foundToken = tokens.find(iToken => iToken.contract_addr == token.token.contract_addr)
    if(foundToken == undefined){
        return undefined
    }
    return { 
        name: foundToken.symbol,
        contractAddress: token.token.contract_addr
    }
}
const getWhitelistedPairs = async (whitelistedTokens) => {
    const pairs = (await axios.get('https://api.terraswap.io/pairs')).data.pairs
    let whitelistedPairs = []
    for(pair of pairs) {
        const tokenA = getTokenNameAndAddress(whitelistedTokens, pair.asset_infos[0])
        const tokenB = getTokenNameAndAddress(whitelistedTokens, pair.asset_infos[1])
        if(tokenA != undefined && tokenB != undefined){
            const pairName = `${tokenA.name}_${tokenB.name}`
            let whitelistedPairNameAndContractAddress = {
                tokens: [tokenA, tokenB],
                name: pairName,
                contractAddress: pair.contract_addr
            }
            whitelistedPairs.push(whitelistedPairNameAndContractAddress)
        }
    }
    return whitelistedPairs
}
const getWhitelistedTokens = async () => {
    const tokens = (await axios.get('https://api.terraswap.io/tokens')).data //filter them out
    return tokens.filter(token => {
        let isTokenBlacklisted = false
        for(dummyToken of dummyTokens) {
            if(dummyToken.contract_addr == token.contract_addr){
                isTokenBlacklisted = true
                break;
            }
        };
        return isTokenBlacklisted === false
    })
}
const getPairsByNameAndContract = async () => {
    try {
        const whitelistedTokens = await getWhitelistedTokens()
        const whitelistedPairs = await getWhitelistedPairs(whitelistedTokens)
        return whitelistedPairs
    } catch(err) {
        console.log('Error: ', err.message);    
    }   
}

module.exports = {
    getPairsByNameAndContract
}