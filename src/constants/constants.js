import { Avatar } from 'react-native-paper'
export const tokenList = [
    {
        logoURI: 'ethereum-logo.png',
        address: '0xbD3eB6b39CcC68dE73b9d0951432bF29d5ABF0ad',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18,
    },
    {
        logoURI: 'usd-coin-logo.png',
        address: '0xFA4aBB6EC55CA20Fda79F7D50dE9aC58C932fa86',
        name: 'USDCoin',
        symbol: 'USDC',
        decimals: 6,
    },
    {
        logoURI: 'dai-logo.png',
        address: '0x5A4B8d5337C4d6440c3aB74828Cea0fB0CE306d4',
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: 18,
    },
    {
        logoURI: 'chainlink-logo.png',
        address: '0x853fa1a0DFBF47257eF01F7033eAB8192e406087',
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
