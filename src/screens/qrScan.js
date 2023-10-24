import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Feather } from "@expo/vector-icons";
import { getImageUrl, tokenList } from "../constants/constants";
import { shortenHex, truncateNumber } from "../utils/util";
import {
  TextInput,
  Avatar,
  Button,
  Modal,
  Portal,
  List,
  MD3Colors,
} from "react-native-paper";
import {
  useContractReads,
  useAccount,
  erc20ABI,
  usePublicClient,
  useContractWrite,
} from "wagmi";
import {
  formatUnits,
  getContractAddress,
  keccak256,
  encodePacked,
  parseUnits,
  waitForTransactionReceipt,
  getAddress,
} from "viem";
import { readContract } from "viem/contract";
import pairAbi from "../utils/ABI/v2Pair";
import router02Abi from "../utils/ABI/router";
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';

if (typeof BigInt == undefined) global.BigInt = require("big-integer");

export default function QRScan({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [payload, setPayload] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = React.useState(false);
  const [status, setStatus] = useState(1); // 0 for nothing, 1 for loading, 2 for success, 3 for failed
  const [hash, setHash] = useState("");

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const showToast = (data) => {
    Toast.show(data);
  }

  const publicClient = usePublicClient();
  let PAIR_ADDRESS_CACHE = {};

  const { writeAsync: approve } = useContractWrite({
    address: tokenList[selectedIndex].address,
    abi: erc20ABI,
    functionName: "approve",
    account: address,
  });

  const { writeAsync: swapAndTransfer } = useContractWrite({
    address: "0x2eD57D4deB54f96476F3c4d73768D3313267885F",
    abi: router02Abi,
    functionName: "swapTokensForExactTokens",
    account: address,
  });

  const { writeAsync: transfer } = useContractWrite({
    address: tokenList.length > 0 && tokenList[selectedIndex].address,
    abi: erc20ABI,
    functionName: "transfer",
    account: address,
  });

  async function getTransactionStatus(hash) {
    setHash(hash);
    setStatus(1); // loading
    showToast({
      type: 'info',
      text1: 'waiting for transaction',
      autoHide: 'true'
    })
    const status = await publicClient.waitForTransactionReceipt(hash);
    if (status.status === "success") {
      showToast({
        type: 'success',
        text1: 'Transaction Successfull',
        autoHide: 'true'
      })
      setStatus(2); // success
    } else {
      showToast({
        type: 'error',
        text1: 'Transaction Failed',
        autoHide: 'true'
      })
      setStatus(3); // failed
    }
  }

  const sendTransactions = async () => {
    if (tokenList[selectedIndex].address === payload.token.address) {
      // intiate same token transfer
      const transferTx = await transfer({
        args: [
          payload.receiver,
          parseUnits(payload.amount, payload.token.decimals),
        ],
      });
      getTransactionStatus(transferTx);
    } else {
      // intitate swap and pay
      const swapParams = await getSwapParams(
        tokenList[selectedIndex], // the tokenm i want to pay with
        payload.token, // the token which should the user recieves : tokenB
        parseUnits(payload.amount, payload.token.decimals), // amount of tokenB
        publicClient,
        {
          ttl: 50,
          recipient: payload.receiver,
          allowedSlippage: BigInt(100),
        }
      );

      const allowance = await publicClient.readContract({
        address: tokenList[selectedIndex].address,
        abi: erc20ABI,
        functionName: "allowance",
        args: [address, "0x2eD57D4deB54f96476F3c4d73768D3313267885F"], // router
      });

      if (allowance < parseUnits(payload.amount, payload.token.decimals)) {
        const approveTx = await approve({
          args: ["0x2eD57D4deB54f96476F3c4d73768D3313267885F", payload.amount],
        });
        await waitForTransactionReceipt(publicClient, { hash: approveTx.hash });
      }

      const swapAndTransferTx = await swapAndTransfer({
        args: swapParams,
      });
      getTransactionStatus(swapAndTransferTx);
    }
  };

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
            from: "0x42C0837Ed0ec31838c3AF353268864212758D55F", // fatory
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

  const getSwapParams = async (
    tokenA,
    tokenB,
    outputAmount,
    publicClient,
    options
  ) => {
    const to = getAddress(options.recipient);
    const reserves = await fetchPairData(tokenA, tokenB, publicClient);

    const path = [tokenA.address, tokenB.address];
    let inputReserve = reserves[0];
    let outputReserve = reserves[1];

    const inputAmount =
      (inputReserve * outputAmount * BigInt(1000)) /
      ((outputReserve - outputAmount) * BigInt(997));

    const slippageAdjustedAmountIn =
      (options.allowedSlippage * inputAmount) / BigInt(100) + BigInt(1);
    const deadline = BigInt(
      Math.floor(new Date().getTime() / 1000) + options.ttl
    );

    return [outputAmount, slippageAdjustedAmountIn, path, to, deadline];
  };

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const { address, isConnecting, isConnected, isDisconnected } = useAccount();

  const { data: balances } = useContractReads({
    contracts: tokenList.map((token) => ({
      address: token.address,
      abi: erc20ABI,
      functionName: "balanceOf",
      args: [address],
    })),
    enabled: !!address,
  });

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setPayload(JSON.parse(data));
    setSelectedIndex(
      tokenList.findIndex(
        (element) => element.address === JSON.parse(data).token.address
      )
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting for camera permission</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Feather name="camera-off" size={40} color="black" />
        <Text style={styles.text}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
                      setSelectedIndex(index);
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
                      <Text>
                        {truncateNumber(
                          balances
                            ? formatUnits(balances[index].result, item.decimals)
                            : 13.0345,
                          2
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
      {!scanned && (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {scanned && (
        <View style={styles.scannedContainer}>
          <View style={styles.logo}>{getImageUrl(payload.token, 100)}</View>
          <View style={styles.scannedWrapper}>
            <Text style={styles.scannedTitle}>Requested Address</Text>
            <Text style={styles.scannedSubTitle}>
              {shortenHex(payload.receiver, 8)}
            </Text>
          </View>
          <View style={styles.scannedWrapper}>
            <Text style={styles.scannedTitle}>Requested Token</Text>
            <Text style={styles.scannedSubTitle}>
              {payload.amount} {payload.token.symbol}
            </Text>
          </View>
          <View style={styles.scannedWrapper}>
            <Text style={styles.scannedTitle}>Select Token to pay</Text>
            <View style={styles.tokenContainer}>
              <Button
                mode="contained-tonal"
                buttonColor="#01AE92"
                textColor="#fff"
                style={{ marginTop: 10, width: "100%" }}
                onPress={showModal}
              >
                <Text>{tokenList[selectedIndex].name}</Text>
              </Button>
            </View>
          </View>
          {status === 0 ? <View style={styles.buttonWrapper}>
            <Button
              buttonColor="green"
              mode="contained"
              onPress={() => sendTransactions()}
            >
              <Text style={styles}>Send</Text>
            </Button>
            <Button mode="outlined" onPress={() => navigation.navigate("Home")}>
              <Text style={styles}>Cancel</Text>
            </Button>
          </View> : <View style={styles.buttonWrapper}>
            <Button
              buttonColor="green"
              mode="contained"
              onPress={() => Linking.openURL('https://evm.ngd.network/' + hash)}
            >
              <Text style={styles}>View on Block Explorer</Text>
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles}>Go Back</Text>
            </Button>
          </View>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    paddingBottom: 50,
  },
  text: {
    fontSize: 20,
    fontFamily: "Inter-Regular",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  scannedContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  scannedWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    width: 350,
  },
  scannedTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  scannedSubTitle: {
    fontSize: 16,
  },
  buttonWrapper: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    width: 350,
    marginTop: 100,
  },
});
