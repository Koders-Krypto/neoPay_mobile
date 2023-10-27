import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { TextInput, Button, Modal, Portal } from "react-native-paper";
import QRCodeStyled from "react-native-qrcode-styled";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { truncateNumber } from "../utils/util";
import { tokenList, getImageUrl } from "../constants/constants";
import { useContractReads, useAccount, erc20ABI } from "wagmi";
import { formatUnits } from "viem";

export default function Recieve({ navigation }) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const QRRef = useRef(null);
  const [amount, setAmount] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = React.useState(false);
  const [showQr, setShowQR] = useState(false);
  const [balances, setBalances] = useState([]);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const { address } = useAccount();

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
    if (data && data.length > 0 && data[0].error === undefined) {
      setBalances(data);
    }
  }, [data])


  useEffect(() => {
    if (balances && balances.length > 0) {
      console.log(balances);
    }
  }, [balances])

  const handlePressDownload = async () => {
    try {
      let isPermissionGranted = permissionResponse?.granted;
      if (!isPermissionGranted) {
        isPermissionGranted = (await requestPermission()).granted;
      }

      if (!isPermissionGranted) {
        throw new Error("Library permission access denied");
      }

      QRRef.current?.toDataURL(async (base64Code) => {
        const filename = FileSystem.documentDirectory + "qr_code.png";

        await FileSystem.writeAsStringAsync(filename, base64Code, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await MediaLibrary.saveToLibraryAsync(filename);
        if (Sharing.isAvailableAsync()) {
          Sharing.shareAsync(filename);
        } else {
          Alert.alert("Sharing access not available");
        }
      });
    } catch (error) {
      console.error("QR sharing failed: ", error);
    }
  };

  Keyboard.addListener("keyboardDidShow", () => {
    setShowQR(false);
  });
  Keyboard.addListener("keyboardDidHide", () => {
    if (amount) {
      setShowQR(true);
    }
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                          {balances && balances.length > 0 ? truncateNumber(formatUnits(balances[index].result, item.decimals), 2) : 0.00}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                );
              })}
            </ScrollView>
          </Modal>
        </Portal>
        <View style={styles.amountInputContainer}>
          <TextInput
            mode="flat"
            style={styles.textInput}
            label="Enter Amount"
            keyboardType="numeric"
            placeholder="Type something"
            onChangeText={(value) => {
              setAmount(value);
            }}
          // right={<TextInput.Affix text="/100" />}
          />

          <View
            onPress={showModal}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#01AE92",
              width: "40%",
              borderRadius: 50,
              padding: 5,
            }}
          >
            <Button onPress={showModal}>
              <Text style={{ color: "#fff" }}>
                {tokenList[selectedIndex].name}
              </Text>
            </Button>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 20,
          }}
        >
          {showQr ? (
            <>
              <View
                style={{
                  borderWidth: 4,
                  borderColor: "#01AE92",
                  borderStyle: "dashed",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <QRCodeStyled
                  data={JSON.stringify({
                    token: tokenList[selectedIndex],
                    amount: amount,
                    receiver: address,
                  })}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                  ref={QRRef}
                  pieceCornerType={"rounded"}
                  pieceBorderRadius={[4, 0, 4]}
                  isPiecesGlued
                  padding={30}
                  pieceSize={5}
                  gradient={{
                    type: "linear",
                    options: {
                      start: [0, 0],
                      end: [1, 1],
                      colors: ["#01AE92", "#01AE92"],
                      locations: [0, 1],
                    },
                  }}
                />
              </View>
              <View style={{ marginTop: 0, width: "100%", padding: 20 }}>
                <Button onPress={handlePressDownload} style={styles.button}>
                  <Text style={styles.buttonText}>Share</Text>
                </Button>
              </View>
            </>
          ) : (
            <View style={{ width: "100%", padding: 20 }}>
              <Button
                onPress={() => {
                  if (amount) {
                    setShowQR(true);
                  } else {
                    Alert.alert("Please enter amount");
                  }
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Generate QR</Text>
              </Button>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  icon: {
    backgroundColor: "#2C2C2B",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  searchBar: {
    backgroundColor: "#2C2C2B",
    color: "#fff",
  },
  contentContainer: {
    flex: 1,
    alignItems: "start",
    backgroundColor: "#fff",
    paddingLeft: 10,
    paddingRight: 10,
    gap: 25,
  },
  amountInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    width: "100%",
    padding: 10,
    gap: 10,
  },

  tokenLabel: {
    fontSize: 18,
    width: "100%",
    fontWeight: "800",
    color: "white",
    fontFamily: "Inter-Regular",
  },
  textInput: {
    backgroundColor: "#fff",
    borderColor: "#01AE92",
    color: "#000",
    width: "50%",
    fontFamily: "Inter-Regular",
  },
  listItemContainer: {
    width: "100%",
  },
  listItemLabel: {
    width: "100%",
    color: "#2C2C2B",
    alignItems: "center",
    justifyContent: "center",
  },
  itemsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  items: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  itemText: {
    fontFamily: "Inter-Medium",
    fontSize: 15,
  },
  itemBalance: {
    fontFamily: "Inter-Bold",
    fontSize: 17,
  },
  button: {
    width: "100%",
    backgroundColor: "#01AE92",
    paddingTop: 5,
    paddingBottom: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    textTransform: "uppercase",
    borderRadius: 8,
    fontFamily: "Inter-Bold",
  },
});
