import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useAccount, useBalance } from 'wagmi'
import { truncateNumber } from '../../utils/util';

export default function BalanceComponent({ navigation }) {
  const [balance, setBalance] = useState();

  const { address, isConnecting, isConnected, isDisconnected } = useAccount();

  const _balance = useBalance({ address: address })

  useEffect(() => {
    if (isDisconnected) {
      navigation.navigate("Login")
    }
  }, [isDisconnected])

  useEffect(() => {
    if (_balance.isSuccess) {
      setBalance(_balance.data)
    }
  }, [_balance])

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        <View style={styles.amountCVontainer}>
          <Text style={styles.amount}>
            {balance ? truncateNumber(balance?.formatted, 3).toFixed(4) : 0}
          </Text>
          <Text style={{ fontSize: 10, paddingLeft: 5 }}>{balance?.symbol}</Text>
        </View>
        <Text style={styles.balanceText}>Total Balance</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: "#01579b",
  },
  amountCVontainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  subTitle: {
    fontSize: 14,
    color: "#030303",
  },
  addressSubtitle: {
    fontSize: 14,
  },
  amount: {
    fontSize: 40,
    color: "#01AE92",
    fontWeight: "bold",
  },
  balanceContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  balanceText: {
    fontSize: 15,
    fontFamily: "Inter-Medium",
    color: "grey"
  },
});
