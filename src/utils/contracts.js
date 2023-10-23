import { useEffect, useState } from "react"
import { useContractReads, useAccount, erc20ABI } from "wagmi";
import { tokenList } from '../constants/constants'

export async function getBalances(address, refresh = true) {
    let balances;
    if (!balances && refresh) {
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
            balances = data;
            return data;
        }, [data])
    } else {
        return balances;
    }

}