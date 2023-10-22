import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import { Avatar } from "react-native-paper";

export default function ContactsComponent() {
  const Item = ({ item }) => {
    return (
      <View style={styles.itemStyle}>
        <Avatar.Text style={styles.avatarStyle} label={item} />
        <Text style={styles.text}>{item}</Text>
      </View>
    );
  };
  const data = ["VA", "XD", "RD", "VA", "XD", "RD"];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <View style={styles.paymentContainer}>
        {data.map((item, index) => {
          return <Item key={index} item={item} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "Inter-Regular",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: 'grey'
  },
  container: {
    flex: 1,
    marginTop: 10,
    padding: 10,
    gap: 10,
  },
  paymentContainer: {
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
  itemStyle: {
    paddingBottom: 10,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 5,
  },
  avatarStyle: { backgroundColor: "#2C2C2B", color: "white" },
});
