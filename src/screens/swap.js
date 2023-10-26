import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import Constants from "expo-constants";
import { Modal, Portal, Dialog, ActivityIndicator, MD2Colors } from "react-native-paper";
import * as Linking from 'expo-linking';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from "react";
import { truncateNumber } from "../utils/util";
import { tokenList, getImageUrl } from "../constants/constants";
import { useContractReads, useAccount, erc20ABI, usePublicClient, useWalletClient } from "wagmi";
import { formatUnits, parseUnits, getContractAddress, keccak256, encodePacked, waitForTransactionReceipt } from "viem";
import { readContract } from "viem/contract";
import pairAbi from "../utils/ABI/v2Pair";
import router02Abi from "../utils/ABI/router";
if (typeof BigInt == undefined) global.BigInt = require("big-integer");


export default function Swap() {
  const [textA, onChangeTextA] = useState("0");
  const [textB, onChangeTextB] = useState("0");
  const [dailogVisible, setDailogVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isSelectedToken, setIsSelectedToken] = useState(0); // 0 is null, 1 is token A, 2 is token B
  const [selectedIndexA, setSelectedIndexA] = useState(0);
  const [selectedIndexB, setSelectedIndexB] = useState(null);
  const [balances, setBalances] = useState([]);
  const [tradeType, setTradeType] = useState("swapExactTokensForTokens") // 0 for exact in, 1 for exact out
  const [status, setStatus] = useState(0);
  const [hash, setHash] = useState(null);

  const { data: walletClient } = useWalletClient();

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const hideDialog = () => setDailogVisible(!dailogVisible);

  const { address } = useAccount();

  const publicClient = usePublicClient();
  let PAIR_ADDRESS_CACHE;


  const { data } = useContractReads({
    contracts: tokenList.map((token) => ({
      address: token.address,
      abi: erc20ABI,
      functionName: "balanceOf",
      args: [address],
    })),
    enabled: !!address,
  });

  useEffect(() => {
    setBalances(data);
  }, [balances])

  async function getTransactionStatus(hash) {
    setHash(hash);
    setStatus(1); // loading
    setDailogVisible(true);
    const _status = await publicClient.waitForTransactionReceipt({ hash });
    if (_status.status === "success") {
      setStatus(2); // success
    } else {
      setStatus(3); // failed
    }
  }

  async function fetchPairData(tokenA, tokenB) {
    const address = getPairAddress(tokenA, tokenB);
    const [reserves0, reserves1] = await new readContract(publicClient, {
      address,
      abi: pairAbi.abi,
      functionName: "getReserves",
    });
    const balances =
      tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
        ? [reserves0, reserves1]
        : [reserves1, reserves0];
    return balances;
  }

  const getExecutionPriceExactIn = async (
    tokenA,
    tokenB,
    inputAmount,
    publicClient
  ) => {
    const reserves = await fetchPairData(tokenA, tokenB, publicClient)
    let inputReserve = reserves[0]
    let outputReserve = reserves[1]

    const outputAmount =
      (inputAmount * BigInt(997) * outputReserve) /
      (inputReserve * BigInt(1000) + inputAmount * BigInt(997))

    return (
      (parseUnits(outputAmount.toString(), tokenA.decimals) *
        parseUnits('1', tokenB.decimals)) /
      parseUnits(inputAmount.toString(), tokenB.decimals)
    )
  }

  const getExecutionPriceExactOut = async (
    tokenA,
    tokenB,
    outputAmount,
    publicClient
  ) => {
    const reserves = await fetchPairData(tokenA, tokenB, publicClient)
    let inputReserve = reserves[0]
    let outputReserve = reserves[1]

    const inputAmount =
      (inputReserve * outputAmount * BigInt(1000)) /
      ((outputReserve - outputAmount) * BigInt(997)) +
      BigInt(1)

    return (
      (parseUnits(inputAmount.toString(), tokenB.decimals) *
        parseUnits('1', tokenA.decimals)) /
      parseUnits(outputAmount.toString(), tokenA.decimals)
    )
  }

  const getSwapParamsExactIn = async (
    tokenA,
    tokenB,
    inputAmount,
    publicClient,
    options
  ) => {
    const to = address
    const reserves = await fetchPairData(tokenA, tokenB, publicClient)

    let inputReserve = reserves[0]
    let outputReserve = reserves[1]

    const outputAmount =
      (inputAmount * BigInt(997) * outputReserve) /
      ((inputReserve * BigInt(1000)) +
        inputAmount * BigInt(997))
    const slippageAdjustedAmountOut =
      (options.allowedSlippage * outputAmount) / BigInt(100)
    const path = [tokenA.address, tokenB.address]
    const deadline = BigInt(Math.floor(new Date().getTime() / 1000) + options.ttl)

    return [inputAmount, slippageAdjustedAmountOut, path, to, deadline]
  }

  const getSwapParamsExactOut = async (
    tokenA,
    tokenB,
    outputAmount,
    publicClient,
    options
  ) => {
    const to = address
    const reserves = await fetchPairData(tokenA, tokenB, publicClient)

    let inputReserve = reserves[0]
    let outputReserve = reserves[1]
    const inputAmount =
      (inputReserve * outputAmount * BigInt(1000)) /
      ((outputReserve - outputAmount) * BigInt(997))
    const slippageAdjustedAmountIn =
      (options.allowedSlippage * inputAmount) / BigInt(100) + BigInt(1)
    const path = [tokenA.address, tokenB.address]
    const deadline = BigInt(Math.floor(new Date().getTime() / 1000) + options.ttl)

    return [outputAmount, slippageAdjustedAmountIn, path, to, deadline]
  }

  function getPairAddress(tokenA, tokenB) {
    const tokens =
      tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
        ? [tokenA, tokenB]
        : [tokenB, tokenA];
    if (
      PAIR_ADDRESS_CACHE?.[tokens[0].address]?.[tokens[1].address] === undefined
    ) {
      PAIR_ADDRESS_CACHE = {
        ...PAIR_ADDRESS_CACHE,
        [tokens[0].address]: {
          ...PAIR_ADDRESS_CACHE?.[tokens[0].address],
          [tokens[1].address]: getContractAddress({
            from: "0x42C0837Ed0ec31838c3AF353268864212758D55F",
            opcode: "CREATE2",
            salt: keccak256(
              encodePacked(
                ["address", "address"],
                [tokens[0].address, tokens[1].address]
              ),
              "bytes"
            ),
            bytecodeHash:
              "0xf7d8e8b1786b94ca2b43284f30d02380992e7d5918b09acc21f3cdb3377d4958",
          }),
        },
      };
    }

    return PAIR_ADDRESS_CACHE[tokens[0].address][tokens[1].address];
  }

  const handleSwap = async () => {
    const swapConfig = {
      allowedSlippage: BigInt(100),
      recipient: address,
      ttl: 50,
    }
    let swapParams;
    const inputAmount = parseUnits(textA, tokenList[selectedIndexA].decimals)
    const outputAmount = parseUnits(textB, tokenList[selectedIndexB].decimals)
    if (tradeType === "swapExactTokensForTokens") {
      // exact in
      swapParams = await getSwapParamsExactIn(
        tokenList[selectedIndexA],
        tokenList[selectedIndexB],
        inputAmount,
        publicClient,
        swapConfig
      )
    } else if (tradeType === "swapTokensForExactTokens") {
      // exact out
      swapParams = await getSwapParamsExactOut(
        tokenList[selectedIndexA],
        tokenList[selectedIndexB],
        outputAmount,
        publicClient,
        swapConfig
      )
    }

    try {
      const allowance = await publicClient.readContract({
        address: tokenList[selectedIndexA].address,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address, '0x2eD57D4deB54f96476F3c4d73768D3313267885F'],
      })
      if (allowance < inputAmount) {
        const approveTx = await walletClient.writeContract({
          address: tokenList[selectedIndexA].address,
          abi: erc20ABI,
          functionName: 'approve',
          args: ['0x2eD57D4deB54f96476F3c4d73768D3313267885F', inputAmount],
        })
        await waitForTransactionReceipt(publicClient, { hash: approveTx.hash });
      }
      console.log(swapParams);
      const swapTx = await walletClient.writeContract({
        address: '0x2eD57D4deB54f96476F3c4d73768D3313267885F',
        abi: router02Abi,
        functionName: tradeType,
        args: swapParams,
      })
      getTransactionStatus(swapTx)
    } catch (error) {
      console.log('swap failed =>', error)
    }

  }

  const handleTextChangeA = async (value) => {
    onChangeTextA(value);
    setTradeType("swapExactTokensForTokens");
    if (selectedIndexA === null || selectedIndexB === null || value === null) { onChangeTextB("0"); return }
    const inputAmount = parseUnits(value, tokenList[selectedIndexA].decimals);
    if (inputAmount <= 0) { onChangeTextB("0"); return }
    const executionPrice = await getExecutionPriceExactIn(
      tokenList[selectedIndexA],
      tokenList[selectedIndexB],
      inputAmount,
      publicClient
    )
    onChangeTextB(
      formatUnits(
        (executionPrice * inputAmount) / parseUnits('1', tokenList[selectedIndexA].decimals),
        tokenList[selectedIndexB].decimals
      )
    )
  }

  const handleTextChangeB = async (value) => {
    onChangeTextB(value);
    setTradeType("swapTokensForExactTokens");
    if (selectedIndexA === null || selectedIndexB === null || value === null) { onChangeTextA("0"); return }
    const outputAmount = parseUnits(value, tokenList[selectedIndexB].decimals)
    if (outputAmount <= 0) { onChangeTextA("0"); return }
    const executionPrice = await getExecutionPriceExactOut(
      tokenList[selectedIndexA],
      tokenList[selectedIndexB],
      outputAmount,
      publicClient
    )
    onChangeTextA(
      formatUnits(
        (executionPrice * outputAmount) / parseUnits('1', tokenList[selectedIndexB].decimals),
        tokenList[selectedIndexA].decimals
      )
    )
  }

  return (
    <View style={styles.wrapper}>
      <Portal>
        <Dialog visible={dailogVisible} onDismiss={hideDialog}>
          <Dialog.Content>
            {hash && status === 1 ?
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, paddingBottom: 10 }}>
                <Text variant="bodyMedium">Transaction Initiated</Text>
                <ActivityIndicator animating={true} color={MD2Colors.red800} />
              </View>
              : status === 2 ?
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, paddingBottom: 10 }}>
                    <Text style={{ color: 'green' }} variant="bodyMedium">Swapped {tokenList[selectedIndexA].symbol} to {tokenList[selectedIndexB].symbol}</Text>
                    <AntDesign name="check" size={24} color="green" />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 10, paddingBottom: 10 }}>
                    <TouchableWithoutFeedback onPress={() => navigation.navigate("Home")}>
                      <View style={{ borderWidth: 1, backgroundColor: 'green', marginRight: 10, paddingLeft: 10, paddingTop: 5, paddingBottom: 5, paddingRight: 10, borderRadius: 10 }}>
                        <Text style={{ color: '#fff' }}>Home</Text>
                      </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => Linking.openURL('https://evm.ngd.network/tx' + hash)}>
                      <View style={{ borderWidth: 1, borderColor: 'green', marginRight: 10, paddingLeft: 10, paddingTop: 5, paddingBottom: 5, paddingRight: 10, borderRadius: 10 }}>
                        <Text style={{ color: 'green' }}>View on explorer</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
                : status === 3 ? <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, paddingBottom: 10 }}>
                    <Text style={{ color: 'red' }} variant="bodyMedium">Failed to swap tokens</Text>
                    <Feather name="alert-triangle" size={24} color="red" />
                  </View>
                  <TouchableWithoutFeedback onPress={() => navigation.navigate("Home")}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 10, paddingBottom: 10 }}>
                      <View style={{ borderWidth: 1, borderColor: 'green', marginRight: 10, paddingLeft: 10, paddingTop: 5, paddingBottom: 5, paddingRight: 10, borderRadius: 10 }}>
                        <Text style={{ color: 'green' }}>Home</Text>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
                  : <></>}
          </Dialog.Content>
        </Dialog>
      </Portal>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={{
            backgroundColor: "white",
            marginLeft: 20,
            marginRight: 20,
            marginBottom: 100,
            marginTop: 100,
            padding: 20,
            justifyContent: "start",
            alignItems: "start",
            borderRadius: 10,
          }}
        >
          <ScrollView>
            {tokenList.map((item, index) => {
              return (
                <View key={index}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      if (isSelectedToken === 1) {
                        setSelectedIndexA(index);
                      } else if (isSelectedToken === 2) {
                        setSelectedIndexB(index);
                      }
                      hideModal();
                    }}
                  >
                    <View
                      style={{
                        paddingTop: 12,
                        paddingBottom: 12,
                        paddingLeft: 5,
                        paddingRight: 5,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: 340,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {getImageUrl(item)}
                        <View
                          style={{ flexDirection: "column", paddingLeft: 10 }}
                        >
                          <Text style={{ alignSelf: "center" }}>
                            {item.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 10,
                              alignItems: "center",
                              textTransform: "uppercase",
                            }}
                          >
                            {item.symbol}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{ fontSize: 16, fontFamily: "Inter-Bold" }}
                      >
                        {truncateNumber(
                          balances && balances.length > 0
                            ? formatUnits(
                              balances[index].result,
                              item.decimals
                            )
                            : '',
                          3
                        )}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              );
            })}
          </ScrollView>
        </Modal>
      </Portal>
      <View style={styles.container}>
        <Text style={styles.title}>You Pay</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            onChangeText={(value) => {
              handleTextChangeA(value)
            }}
            value={textA}
          />
          <TouchableWithoutFeedback onPress={() => {
            setIsSelectedToken(1)
            showModal()
          }}>
            <View style={styles.button} >
              <Text style={styles.buttonText}>{selectedIndexA !== null ? tokenList[selectedIndexA].symbol : "Select Token"}</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.row}>
          <Text style={styles.subText}></Text>
          <View style={styles.row}>
            <Text style={styles.subText}>Balance: {balances && balances.length > 0 && selectedIndexA !== null ? truncateNumber(formatUnits(balances[selectedIndexA].result, tokenList[selectedIndexA].decimals), 3) : 0.00}</Text>
            <TouchableWithoutFeedback onPress={() => {
              if (balances && balances.length > 0 && selectedIndexA !== null) {
                const _maxBalance = truncateNumber(formatUnits(balances[selectedIndexA].result, tokenList[selectedIndexA].decimals), 3).toString();
                onChangeTextA(_maxBalance);
              }
            }}><Text style={styles.subTextColor}>Max</Text></TouchableWithoutFeedback>
          </View>
        </View>
      </View>
      <TouchableWithoutFeedback onPress={() => {
        let _textA = textA;
        let _textB = textB;
        let indexA = selectedIndexA;
        let indexB = selectedIndexB;
        onChangeTextA(_textB);
        onChangeTextB(_textA);
        setSelectedIndexA(indexB);
        setSelectedIndexB(indexA);
      }}>
        <View style={styles.swapIcon}>
          <Ionicons name="swap-vertical" size={30} color="white" />
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.container}>
        <Text style={styles.title}>You Recieve</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            onChangeText={(value) => {
              handleTextChangeB(value)
            }}
            value={textB}
          />
          <TouchableWithoutFeedback onPress={() => {
            setIsSelectedToken(2)
            showModal()
          }}>
            <View style={styles.button} >
              <Text style={styles.buttonText}>{selectedIndexB !== null ? tokenList[selectedIndexB].symbol : "Select Token"}</Text>
            </View>
          </TouchableWithoutFeedback>

        </View>
        <View style={styles.row}>
          <Text style={styles.subTextHidden}>$1600</Text>
          <View style={styles.row}>
            <Text style={styles.swapTextHidden}>Balance: 0.1</Text>
          </View>
        </View>
      </View>
      <TouchableWithoutFeedback onPress={() => {
        handleSwap();
      }}>
        <View style={styles.swapButton}>
          <Text style={styles.swapText}>Swap</Text>
          <AntDesign name="swap" size={30} color="white" />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  swapIcon: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 50,
    backgroundColor: "#000",
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  wrapper: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "start",
    padding: 10,
    gap: 10,
    width: "100%",
    paddingTop: 20,
  },
  container: {
    backgroundColor: "black",
    width: "100%",
    padding: 20,
    borderRadius: 10,
    gap: 20,
  },
  title: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Inter-Regular",
  },
  textInput: {
    backgroundColor: "rgba(52, 52, 52, 0)",
    color: "#FFF",
    fontSize: 36,
    width: '60%',
    fontFamily: "Inter-Bold",
  },
  button: {
    backgroundColor: "#01AE92",
    padding: 10,
    fontSize: 20,
    borderRadius: 50,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  swapButton: {
    backgroundColor: "#01AE92",
    padding: 10,
    fontSize: 20,
    borderRadius: 10,
    width: "100%",
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  swapText: {
    color: "#FFF",
    fontSize: 24,
    textAlign: "center",
    paddingTop: 5,
    paddingBottom: 5,
    fontFamily: "Inter-Bold",
  },
  swapTextHidden: {
    color: "#000",
  },
  subText: {
    fontSize: 16,
    color: "#FFF",
    fontFamily: "Inter-Regular",
  },
  subTextHidden: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Inter-Regular",
  },
  subTextColor: {
    fontSize: 16,
    color: "#01AE92",
    fontFamily: "Inter-Bold",
  },
});
