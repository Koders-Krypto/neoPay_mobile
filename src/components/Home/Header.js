import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
} from "react-native";
import { shortenHex } from "../../utils/util";
import { W3mButton, Web3Modal } from '@web3modal/wagmi-react-native'
import { useEffect, useState } from "react";
import { useAccount, useBalance } from 'wagmi'

export default function HeaderComponent({ navigation }) {

  const { address, isConnecting, isConnected, isDisconnected } = useAccount();

  useEffect(() => {
    if (isDisconnected) {
      navigation.navigate("Login")
    }
  }, [isDisconnected])



  return (
    <View style={styles.container}>
      <W3mButton />
      {/* <TouchableHighlight style={[styles.profileImgContainer]}>
        <Image
          source={{
            url: "https://cryptologos.cc/logos/neo-neo-logo.png",
          }}
          style={styles.profileImg}
        />
      </TouchableHighlight> */}
      {/* <View style={styles.listView}> */}
      {/* <Text style={styles.title}>
          {shortenHex("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 10)}
        </Text> */}
      {/* <W3mButton />
      </View> */}
      {/* <W3mButton /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    // padding: 5
  },
  profileImgContainer: {
    height: 60,
    width: 60,
    borderRadius: 50,
  },
  profileImg: {
    height: 40,
    width: 40,
    borderRadius: 50,
    overflow: "hidden",
  },
  listView: {
    // paddingLeft: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    paddingLeft: 10,
    fontFamily: "Inter-Bold",
    color: "#01579b",
  },
  subTitle: {
    fontSize: 14,
    color: "#030303",
    fontFamily: "Inter-Regular",
  },
  addressSubtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
  },
});
