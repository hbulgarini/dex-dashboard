import { saveRecordsToLocalStorage, readAllRecordsFromLocalStorageByPrefix, idIsRegisteredInLocalStorage, getSwapPrefix } from './localStorageManager'
import Decimal from 'decimal.js';
import moment from 'moment'
const uri = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'

const loadMoreInfoPair = async (pairId) => {
    const getSwaps = async () => {
        let time = 0;
        let records = 1;
        let swaps = [];

        console.log(`Time ${time}, Records ${records}`)

        do {
            const skip = time * 1000
            if (!records) {
                break
            }

            const query = `
            query Query {
                swaps(
                    first: 1000,
                    skip: ${skip},
                    orderBy: timestamp, orderDirection: desc, where:
                    { pair: "${pairId}" }
                   ) {
                    id
                    pair {
                          token0 {
                           id
                            symbol
                          }
                          token1 {
                           id
                            symbol
                          }
                        }
                    amountUSD
                    sender
                    to
                    amount0In
                    amount0Out
                    amount1In
                    amount1Out
                    amountUSD
                    to
                    transaction {
                        id
                    }
                    timestamp
                }
            }
            `;

            console.log(query)

            const querySwaps = await fetch(uri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ query })
            });

            const data = (await querySwaps.json()).data.swaps
            console.log('data', data)
            time++;
            if (records > 0) {
                records = data.length
                console.log(`Swaps record length: ${records}`)
                swaps = [...swaps, ...data]
            }
        } while (records > 0)
        return swaps
    }

    const swaps = await getSwaps();



    console.log(`Swaps found: ${swaps.length}`)

    const desiredSymbols = ["WETH", "USDC", "DAI"];

    const getSymbolAndAddress = (swap, desiredSymbols) => {
        if (desiredSymbols.includes(swap.pair.token0.symbol)) {
            return { symbol: swap.pair.token1.symbol, tokenAddress: swap.pair.token1.id }
        }
        return { symbol: swap.pair.token0.symbol, tokenAddress: swap.pair.token0.id }
    }

    const getTotalOutputAmount = (data, desiredSymbols) =>
        data.reduce((total, obj) => {
            if (desiredSymbols.includes(obj.pair.token0.symbol)) {
                return total.plus(new Decimal(obj.amount0Out));
            }
            return total.plus(new Decimal(obj.amount1Out));
        }, new Decimal(0));

    const getFormattedValues = (temp) => {
        const beforeDecimalPoint = temp.substring(0, temp.indexOf("."));
        const afterDecimalPoint = temp.substring(temp.indexOf(".") + 1, temp.indexOf(".") + 3);

        return `${beforeDecimalPoint}.${afterDecimalPoint}`
    }

    const getSwapInfo = (swap, desiredSymbols) => {
        const { pair, amount0In, amount0Out, amount1In, amount1Out } = swap;
        const { token0, token1 } = pair;
        if (desiredSymbols.includes(token0.symbol) && amount0Out !== "0") {
            return {
                amountIn: amount1In,
                amountOut: amount0Out,
                type: "OUT",
                tokenIn: token1,
                tokenOut: token0
            };
        }
        if (desiredSymbols.includes(token1.symbol) && amount1Out !== "0") {
            return {
                amountIn: amount0In,
                amountOut: amount1Out,
                type: "OUT",
                tokenIn: token0,
                tokenOut: token1
            };
        }
        if (!desiredSymbols.includes(token0.symbol) && amount1Out === "0") {
            return {
                amountIn: amount1In,
                amountOut: amount0Out,
                type: "IN",
                tokenIn: token1,
                tokenOut: token0
            };
        }
        if (!desiredSymbols.includes(token1.symbol) && amount0Out === "0") {
            return {
                amountIn: amount0In,
                amountOut: amount1Out,
                type: "IN",
                tokenIn: token0,
                tokenOut: token1
            };
        }
    };

    const records = swaps.map(swap => {
        let info = {};
        const { symbol, tokenAddress } = getSymbolAndAddress(swap, desiredSymbols)
        info.id = swap.id;
        info.token0 = swap.pair.token0.symbol
        info.token1 = swap.pair.token1.symbol
        info.amountUSD = getFormattedValues(swap.amountUSD);

        const action = getSwapInfo(swap, desiredSymbols);
        const { amountIn, amountOut, type, tokenIn, tokenOut } = getSwapInfo(swap, desiredSymbols);
        const price = Decimal(amountOut).dividedBy(amountIn);

        info.amountIn = amountIn;
        info.amountOut = amountOut;
        info.type = type;
        info.tokenIn = tokenIn;
        info.tokenOut = tokenOut;
        info.price = price;

        const date = new Date(swap.timestamp * 1000);
        info.created = date.toUTCString();

        return info
    })

    const allRecords = await readAllRecordsFromLocalStorageByPrefix(getSwapPrefix());
    const newRecords = await saveRecordsToLocalStorage(pairId, records, getSwapPrefix())

    return [...records, ...allRecords]
}

export default loadMoreInfoPair;



