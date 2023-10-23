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
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { AntDesign } from "@expo/vector-icons";

export default function Swap() {
  const [text, onChangeText] = React.useState("0");
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.title}>You Pay</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.textInput}
            onChangeText={onChangeText}
            value={text}
          />
          <View style={styles.button}>
            <Text style={styles.buttonText}>Select a Token</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.subText}>$1600</Text>
          <View style={styles.row}>
            <Text style={styles.subText}>Balance: 0.1</Text>
            <Text style={styles.subTextColor}>Max</Text>
          </View>
        </View>
      </View>
      <View style={styles.swapIcon}>
        <Ionicons name="swap-vertical" size={30} color="white" />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>You Recieve</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.textInput}
            onChangeText={onChangeText}
            value={text}
          />
          <View style={styles.button}>
            <Text style={styles.buttonText}>Select a Token</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.subTextHidden}>$1600</Text>
          <View style={styles.row}>
            <Text style={styles.swapTextHidden}>Balance: 0.1</Text>
          </View>
        </View>
      </View>
      <View style={styles.swapButton}>
        <Text style={styles.swapText}>Swap</Text>
        <AntDesign name="swap" size={30} color="white" />
      </View>
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
    border: 0,
    backgroundColor: "rgba(52, 52, 52, 0)",
    color: "#FFF",
    fontSize: 36,
    fontFamily: "Inter-Bold",
  },
  button: {
    backgroundColor: "#01AE92",
    padding: 10,
    fontSize: 20,
    borderRadius: "50%",
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
