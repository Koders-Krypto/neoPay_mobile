import { View, Text, StyleSheet } from "react-native";
import { shortenHex, truncateNumber } from "../../utils/util";
import * as React from "react";
import { Feather } from "@expo/vector-icons";
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import moment from 'moment'
import { TouchableWithoutFeedback } from "react-native";
import * as Linking from 'expo-linking';


export default function RecentTransactionsComponent({ navigation }) {
  const [value, setValue] = React.useState(0);

  const { address } = useAccount()

  const [transaction, setTransactions] = React.useState([]);


  const url = `https://evm.ngd.network/api?module=account&action=tokentx&address=${address}&offset=10`;

  const getData = async () => {
    fetch(url).then(response => response.json())
      .then(json => {
        if (json.message === "OK") {
          console.log("called");
          setTransactions(json.result);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  React.useEffect(() => {
    navigation.addListener('focus', () => {
      getData();
    });
  }, [navigation])

  React.useEffect(() => {
    getData();
  }, [])

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", gap: 24, paddingBottom: 10 }}>
        <Text
          style={value === 0 ? styles.titleActive : styles.title}
          onPress={() => setValue(0)}
        >
          Transactions
        </Text>
        <Text
          style={value === 1 ? styles.titleActive : styles.title}
          onPress={() => setValue(1)}
        >
          Liquidity Pools
        </Text>
      </View>
      {value === 0 ? (
        <View style={styles.transactionsView}>
          {transaction.map((item, index) => {
            return (
              <View key={index} style={styles.hashContainer}>
                <TouchableWithoutFeedback onPress={() => {
                  Linking.openURL('https://evm.ngd.network/' + item.hash)
                }}>
                  <View style={{ flexDirection: "column", justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8 }}>
                    <Text style={styles.status}>
                      {shortenHex(item.from, 6, "...")}
                    </Text>
                    <Text style={styles.timeStamp}>{moment.unix(item.timeStamp).format('ll')}</Text>
                  </View>
                </TouchableWithoutFeedback>

                <View style={styles.pricecontainer}>
                  {item.to === address ? (
                    <Feather
                      name="arrow-down-right"
                      size={20}
                      color={"green"}
                    />
                  ) : (
                    <Feather name="arrow-up-right" size={20} color={"red"} />
                  )}
                  <Text>
                    <Text
                      style={
                        item.to === address ? styles.amountGreen : styles.amountRed
                      }
                    >
                      {truncateNumber(formatUnits(item.value, item.tokenDecimal), 3)}</Text> <Text style={{ fontSize: 14 }}>{item.tokenSymbol}</Text>
                  </Text>
                </View>

              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.transactionsView}>
          <Text style={{ fontSize: 30 }}>Coming Soon...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pricecontainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-Medium",
    color: "grey",
  },
  titleActive: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "#2C2C2B",
    opacity: 20,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff'
  },
  transactionsView: {
    flex: 1,
    width: 390,
    justifyContent: 'center',
    alignItems: "center",
    minHeight: 300,
    marginTop: 20,
    gap: 20,
  },
  hashContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    textAlign: "left",
  },
  timeStamp: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "gray",

    textAlign: "left",
  },
  status: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "gray",
    textAlign: 'left'
  },

  amountGreen: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "green",
  },
  amountRed: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "red",
  },
});
