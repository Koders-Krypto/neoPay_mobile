import { View, Text, StyleSheet } from "react-native";
import { shortenHex } from "../../utils/util";
import * as React from "react";
import { Feather } from "@expo/vector-icons";

export default function RecentTransactionsComponent() {
  const [value, setValue] = React.useState(0);
  const explorer = "https://evm.ngd.network/tx/";
  const data = [
    {
      "in/out": true,
      amount: 9.0,
      sentAddress: "0x6D9bD8a83533De4E3b26370F18E28e5e3EC86DBa",
      timeStamp: "Oct 23, 2023",
    },
    {
      "in/out": false,
      amount: 10,
      sentAddress: "0x3ee3ffd237513a3477282eba5f7c0adf271e4afa",
      timeStamp: "Sep 23, 2023",
    },
    {
      "in/out": true,
      amount: 0.3,
      sentAddress: "0x6D9bD8a83533De4E3b26370F18E28e5e3EC86DBa",
      timeStamp: "Mar 23, 2023",
    },
    {
      "in/out": false,
      amount: 5.5,
      sentAddress: "0x3ee3ffd237513a3477282eba5f7c0adf271e4afa",
      timeStamp: "Jan 23, 2023",
    },
    {
      "in/out": false,
      amount: 0.001,
      sentAddress: "0x3ee3ffd237513a3477282eba5f7c0adf271e4afa",
      timeStamp: "Feb 21, 2023",
    },
    {
      "in/out": true,
      amount: 5,
      sentAddress: "0x6D9bD8a83533De4E3b26370F18E28e5e3EC86DBa",
      timeStamp: "Aug 1, 2023",
    },
    {
      "in/out": true,
      amount: 1.321,
      sentAddress: "0x3ee3ffd237513a3477282eba5f7c0adf271e4afa",
      timeStamp: "Sep 12, 2022",
    },
  ];

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
          Pools
        </Text>
      </View>
      {value === 0 ? (
        <View style={styles.transactionsView}>
          {data.map((item, index) => {
            return (
              <View key={index} style={styles.hashContainer}>
                <View style={{ flexDirection: "column", gap: 8 }}>
                  <Text style={styles.status}>
                    {shortenHex(item.sentAddress, 6, "...")}
                  </Text>
                  <Text style={styles.timeStamp}>{item.timeStamp}</Text>
                </View>

                <View style={styles.pricecontainer}>
                  {item["in/out"] ? (
                    <Feather
                      name="arrow-down-right"
                      size={30}
                      color={"green"}
                    />
                  ) : (
                    <Feather name="arrow-down-left" size={30} color={"red"} />
                  )}
                  <Text
                    style={
                      item["in/out"] ? styles.amountGreen : styles.amountRed
                    }
                  >
                    ${item.amount}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.transactionsView}>
          <Text>Pools</Text>
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
  },
  transactionsView: {
    flex: 1,
    width: "100%",
    gap: 8,
  },
  hashContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    width: "100%",
    textAlign: "left",
  },
  timeStamp: {
    fontSize: 18,
    fontFamily: "Inter-Regular",
    color: "gray",

    textAlign: "left",
  },
  status: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "gray",
  },

  amountGreen: {
    fontSize: 25,
    fontFamily: "Inter-Bold",
    color: "green",
  },
  amountRed: {
    fontSize: 25,
    fontFamily: "Inter-Bold",
    color: "red",
  },
});
