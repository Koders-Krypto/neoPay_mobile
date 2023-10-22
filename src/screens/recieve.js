import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  Alert,
  ScrollView,
  Pressable,
  TouchableWithoutFeedback
} from "react-native";
import { TextInput, Avatar, Button, Modal, Portal, List, MD3Colors } from "react-native-paper";
import QRCodeStyled from 'react-native-qrcode-styled';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { truncateNumber } from '../utils/util'
import { tokenList, getImageUrl } from '../constants/constants';
import { useContractReads, useAccount, erc20ABI } from "wagmi";
import { formatUnits } from "viem";


export default function Recieve({ navigation }) {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const QRRef = useRef(null);
  const [amount, setAmount] = useState("");
  const [textFontSize, setTextFontSize] = useState(50);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visible, setVisible] = React.useState(false);
  const [showQr, setShowQR] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const { address, isConnecting, isConnected, isDisconnected } = useAccount()

  const { data: balances } = useContractReads({
    contracts: tokenList.map(
      (token) =>
      ({
        address: token.address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [address],
      })
    ),
    enabled: !!address,
  })

  const handleTextChange = (text) => {
    setAmount(text);
    setTextFontSize(
      text.length > 6 && text.length < 9 ? 40 : text.length > 8 ? 30 : 60
    );
  };

  const handlePressDownload = async () => {
    try {
      let isPermissionGranted = permissionResponse?.granted;
      if (!isPermissionGranted) {
        isPermissionGranted = (await requestPermission()).granted;
      }

      if (!isPermissionGranted) {
        throw new Error('Library permission access denied');
      }

      QRRef.current?.toDataURL(async (base64Code) => {
        const filename = FileSystem.documentDirectory + 'qr_code.png';

        await FileSystem.writeAsStringAsync(filename, base64Code, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await MediaLibrary.saveToLibraryAsync(filename);
        if (Sharing.isAvailableAsync()) {
          Sharing.shareAsync(filename)
        } else {
          Alert.alert('Sharing access not available');
        }
      });
    } catch (error) {
      console.error('QR sharing failed: ', error);
    }
  };

  Keyboard.addListener(
    'keyboardDidShow',
    () => {
      setShowQR(false);
    }
  );
  Keyboard.addListener(
    'keyboardDidHide',
    () => {
      // setShowQR(true)
    }
  );

  return (
    <View style={styles.container}>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={{ backgroundColor: 'white', marginLeft: 20, marginRight: 20, marginBottom: 100, marginTop: 100, padding: 20, justifyContent: 'start', alignItems: 'start', borderRadius: 10 }}>
          <ScrollView >
            {tokenList.map((item, index) => {
              return (
                <View key={index} >
                  <TouchableWithoutFeedback onPress={() => {
                    setSelectedIndex(index);
                    hideModal()
                  }} >
                    <View style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 5, paddingRight: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {getImageUrl(item)}
                        <View style={{ flexDirection: 'column', paddingLeft: 10, }}>
                          <Text style={{ alignSelf: 'center' }}>{item.name}</Text>
                          <Text style={{ fontSize: 10, alignItems: 'center', textTransform: 'uppercase', }}>{item.symbol}</Text>
                        </View>
                      </View>
                      <Text>{truncateNumber(balances && balances.length > 0 ? formatUnits(balances[index].result, item.decimals) : 13.0345, 2)}</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              )
            })}
          </ScrollView>
        </Modal>
      </Portal>
      <View style={styles.amountInputContainer}>
        <TextInput
          mode="outlined"
          style={styles.textInput}
          label="Enter Amount"
          keyboardType="decimal-pad"
          placeholder="Type something"
          onChangeText={(value) => {
            setAmount(value);
          }}
        // right={<TextInput.Affix text="/100" />}
        />
      </View>
      <View style={styles.tokenContainer}>
        <Button mode="contained-tonal" buttonColor="#01AE92" textColor="#fff" style={{ marginTop: 10, width: '100%' }} onPress={showModal}>
          <Text>{tokenList[selectedIndex].name}</Text>
        </Button>
      </View>
      <View
        style={{
          flex: 1,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 150,
        }}
      >
        {showQr ? <><View style={{ borderWidth: 2, borderColor: '#01AE92', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }}>
          <QRCodeStyled
            data={JSON.stringify({
              token: tokenList[selectedIndex],
              amount: amount,
              receiver: address
            })}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              overflow: 'hidden',
            }}
            logoBackgroundColor='white'
            ref={QRRef}
            pieceCornerType={'rounded'}
            pieceBorderRadius={[4, 0, 4]}
            isPiecesGlued
            padding={2}
            pieceSize={5}
            gradient={{
              type: 'linear',
              options: {
                start: [0, 0],
                end: [1, 1],
                colors: ['#017592', '#606363'],
                locations: [0, 1],
              },
            }}
          />
        </View>
          <View style={{ marginTop: 100, width: '85%' }}>
            <Button
              onPress={handlePressDownload}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Share</Text>
            </Button>
          </View></> : <View style={{ marginTop: 100, width: '85%' }}>
          <Button
            onPress={() => {
              console.log(selectedIndex);
              console.log(amount);
              if (amount) {
                setShowQR(true)
              } else {
                Alert.alert("Please enter amount")
              }

            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Generate QR</Text>
          </Button>
        </View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    backgroundColor: "#2C2C2B",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: "white",
    width: '90%',
    padding: 10,
  },
  tokenContainer: {
    width: '85%',
    alignItems: "center",
  },
  tokenLabel: {
    fontSize: 18,
    width: '85%',
    fontWeight: "800",
    color: "white",
    fontFamily: "Inter-Regular",
  },
  textInput: {
    width: '100%',
    backgroundColor: "#fff",
    borderColor: "#01AE92",
    color: "#000",
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
    width: '100%',
    backgroundColor: '#01AE92',
    paddingTop: 5,
    paddingBottom: 5
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    borderRadius: 8,
  },
});
