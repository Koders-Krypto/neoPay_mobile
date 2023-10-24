import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Appearance,
  useColorScheme,
  ScrollView,
  SafeAreaView,
} from "react-native";
import HeaderComponent from "../components/Home/Header";
import BalanceComponent from "../components/Home/Balance";
import QuickPayComponent from "../components/Home/QuickPay";
import Constants from "expo-constants";
import RecentTransactionsComponent from "../components/Home/RecentTransaction";
import ContactsComponent from "../components/Home/Contacts";
import { useAccount } from 'wagmi'


export default function Home({ navigation }) {

  const { address, isConnecting, isDisconnected } = useAccount()

  useEffect(() => {
    if (isDisconnected) {
      navigation.navigate("Login")
    }
  }, [isDisconnected])

  return (
    <ScrollView style={{ backgroundColor: '#ffffff' }}>
      <View style={styles.container}>
        <HeaderComponent navigation={navigation} />
        <BalanceComponent navigation={navigation} />
        <QuickPayComponent navigation={navigation} />
        <ContactsComponent navigation={navigation} />
        <RecentTransactionsComponent navigation={navigation} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "start",
    justifyContent: "start",
    padding: 10,
  },
  space: {
    height: 10,
  },
  image: {
    flex: 0.5,
    width: "80%",
    height: "50%",
    backgroundColor: "#0553",
  },
});
