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
import { useEffect } from "react";
import Constants from "expo-constants";
import Logo from "../../assets/here_image.svg";
import { W3mButton } from "@web3modal/wagmi-react-native";
import { useAccount } from "wagmi";
import { Button } from "react-native-paper";

export default function Login({ navigation }) {
  const { address, isConnecting, isConnected, isDisconnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      navigation.navigate("Home");
    }
  }, [isConnected, isConnecting]);

  // prevent going back
  useEffect(() => {
    // console.log(isConnected)
    // if (isConnected) {
    //     return;
    // }
    // navigation.addListener('beforeRemove', (e) => {
    //     e.preventDefault();
    // }),
    // navigation.reset({
    //     index: 0,
    //     routes: [{ name: 'Login' }],
    // });

    [navigation];
  });

  return (
    <SafeAreaView style={{ flex: 1, marginTop: Constants.statusBarHeight }}>
      <View style={styles.container}>
        <Text style={styles.title}>{"WELCOME TO \nNEOPAY"}</Text>
        {/* <Text style={{ color: "grey", fontSize: 20 }}>
          Connect your wallet to proceed
        </Text> */}
        <Logo width={"100%"} height={"70%"} />
        <View style={styles.buttonContainer}>
          {isDisconnected ? (
            <W3mButton />
          ) : isConnected ? (
            <Button
              buttonColor="#01AE92"
              mode="contained"
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Button>
          ) : (
            <></>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
    gap: 2,
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: 40,
    marginTop: 30,
    color: "#01AE92",
  },
  buttonContainer: {
    paddingTop: 40,
  },
  buttonText: {
    paddingTop: 5,
    paddingLeft: 5,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Inter-Medium",
  },
});
