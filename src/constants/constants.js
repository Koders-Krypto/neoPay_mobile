import { Avatar } from 'react-native-paper'
export const tokenList = [
    {
        logoURI: 'ethereum-logo.png',
        address: '0x2aCB7bfB8D91E998C33B90D5C3980fe9A2c9dF2d',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18,
    },
    {
        logoURI: 'usd-coin-logo.png',
        address: '0xD0d4C08136877F7E25A355900B20100fBF19562A',
        name: 'USDCoin',
        symbol: 'USDC',
        decimals: 6,
    },
    {
        logoURI: 'dai-logo.png',
        address: '0x43B0f98ED4f1f008375882934f35b2620E8aE0a1',
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: 18,
    },
    {
        logoURI: 'chainlink-logo.png',
        address: '0x6Edfe03bA366C1A6b571Ac583fa4E4500b682C3f',
        name: 'ChainLink Token',
        symbol: 'LINK',
        decimals: 18,
    },
]

export function getImageUrl(item, size = 40) {
    switch (item.symbol) {
        case 'WETH':
            return (
                <Avatar.Image style={{ backgroundColor: '#fff', borderWidth: 1, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }} size={size} source={require('../../assets/tokens/ethereum-logo.png')} />
            );
        case 'USDC':
            return (
                <Avatar.Image style={{ backgroundColor: '#fff', borderWidth: 1, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }} size={size} source={require('../../assets/tokens/usd-coin-logo.png')} />
            );
        case 'DAI':
            return (
                <Avatar.Image style={{ backgroundColor: '#fff', borderWidth: 1, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }} size={size} source={require('../../assets/tokens/dai-logo.png')} />
            );
        case 'LINK':
            return (
                <Avatar.Image style={{ backgroundColor: '#fff', borderWidth: 1, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }} size={size} source={require('../../assets/tokens/chainlink-logo.png')} />
            );
        default:
            return (<></>)
    }
}
