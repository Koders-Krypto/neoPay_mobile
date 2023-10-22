import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

export default function QuickPayComponent({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.paymentContainer}>
        <View style={styles.QuickMenuIItemContainer}>
          <TouchableHighlight
            style={styles.iconContainer}
            onPress={() => navigation.navigate("QRScan")}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="scan" style={styles.icons} color="white" />
              <Text style={styles.text}>Scan</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View style={styles.QuickMenuIItemContainer}>
          <TouchableHighlight
            style={styles.iconContainer}
            onPress={() => navigation.navigate("Recieve")}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="ios-qr-code" style={styles.icons} color="white" />
              <Text style={styles.text}>Recieve</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View style={styles.QuickMenuIItemContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="swap-calls"
              style={styles.icons}
              color="white"
            />
            <Text style={styles.text}>Swap</Text>
          </View>
        </View>
        <View style={styles.QuickMenuIItemContainer}>
          <View style={styles.iconContainer}>
            <AntDesign name="appstore-o" style={styles.icons} color="white" />
            <Text style={styles.text}>More</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 4,
    marginHorizontal: "auto",
    width: 400,
    backgroundColor: "#2C2C2B",
    padding: 15,
    borderRadius: 35
  },
  paymentContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  QuickMenuIItemContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontFamily: "Inter-Regular",
  },
  icons: {
    fontSize: 40,
    padding: 10,
    color: "#01AE92"
  },
  iconContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 5,
  },
});
