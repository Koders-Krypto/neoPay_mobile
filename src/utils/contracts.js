import { useEffect, useState } from "react"
import { useContractReads, useAccount, erc20ABI } from "wagmi";
import { tokenList } from '../constants/constants'

export async function _getBalances(address, refresh) {
    const [balances, setBalances] = useState();
    if (!refresh || !balances) {
        const { data } = useContractReads({
            contracts: tokenList.map(
                (token) =>
                ({
                    address: token.address,
                    abi: erc20ABI,
                    functionName: 'balanceOf',
                    args: [address],
                })
            ),
            enabled: !!address,
        })

        useEffect(() => {
            setBalances(data);
            return data;
        }, [data])
    } else {
        return balances;
    }
}

export async function getBalances(refresh = false) {
    const { address, isConnecting, isConnected, isDisconnected } = useAccount()
    useEffect(() => {
        if (isConnected) {
            fetchBalance();
        }
    }, [isConnected])
    async function fetchBalance() {
        return await _getBalances(address, refresh);
    }
}