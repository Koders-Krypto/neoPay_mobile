import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
} from "react-native";
import { shortenHex } from "../../utils/util";

export default function RecentTransactionsComponent() {
  const data = [
    {
      hash: "0xd4e0ba68288c80f3508546fda861995fd316ecf5d9cf4192a14c11bb56c82763",
      link: "https://evm.ngd.network/tx/0xd4e0ba68288c80f3508546fda861995fd316ecf5d9cf4192a14c11bb56c82763",
      amount: 10,
    },
    {
      hash: "0x1b4aa5654f8b2d100d038cfabbaa50b55f2f8c8666253270ce73e1d2fa81aaad",
      link: "https://evm.ngd.network/tx/0x1b4aa5654f8b2d100d038cfabbaa50b55f2f8c8666253270ce73e1d2fa81aaad",
      amount: 5,
    },
    {
      hash: "0xa8d01034548f49fd500000dfc39bd7e92fc280ed330e6e363a1b632d872d9792",
      link: "https://evm.ngd.network/tx/0xa8d01034548f49fd500000dfc39bd7e92fc280ed330e6e363a1b632d872d9792",
      amount: 1,
    },
    {
      hash: "0x4ab1e88fbd97640cfc47314d51aa3e4aadd4e81c8b097959c553dc8b1a49fc1f",
      link: "https://evm.ngd.network/tx/0x4ab1e88fbd97640cfc47314d51aa3e4aadd4e81c8b097959c553dc8b1a49fc1f",
      amount: 0.1,
    },
    {
      hash: "0xfa287e15cce36d1ca16ba475b945d1837b9c8ab1066321d74905435ca03ea0c4",
      link: "https://evm.ngd.network/tx/0xfa287e15cce36d1ca16ba475b945d1837b9c8ab1066321d74905435ca03ea0c4",
      amount: 0,
    },
    {
      hash: "0xf76c7489a0e6247a7d5211e581071c542ac82bb95fbc3b49202013bee35c6b61",
      link: "https://evm.ngd.network/tx/0xf76c7489a0e6247a7d5211e581071c542ac82bb95fbc3b49202013bee35c6b61",
      amount: 33,
    },
    {
      hash: "0xe33d0c8eb75aac21850fd681600237fcc0992c049f54ae52164fa32ceca346b4",
      link: "https://evm.ngd.network/tx/0xe33d0c8eb75aac21850fd681600237fcc0992c049f54ae52164fa32ceca346b4",
      amount: 22,
    },
    {
      hash: "0x2dae5cf540f52f8fad617ae315ec591cafbf1dd3634a478622539cd81b3301cc",
      link: "https://evm.ngd.network/tx/0x2dae5cf540f52f8fad617ae315ec591cafbf1dd3634a478622539cd81b3301cc",
      amount: 13,
    },
    {
      hash: "0x724ce75d6b511a629dded8d8d19c3fedb5972c3370649e813e0f2437e72537af",
      link: "https://evm.ngd.network/tx/0x724ce75d6b511a629dded8d8d19c3fedb5972c3370649e813e0f2437e72537af",
      amount: 0,
    },
    {
      hash: "0xa1578bfc03eab0de71ea7b6b906997ce67296cefc5a975968aaa5ba5fcd3c577",
      link: "https://evm.ngd.network/tx/0xa1578bfc03eab0de71ea7b6b906997ce67296cefc5a975968aaa5ba5fcd3c577",
      amount: 0,
    },
    {
      hash: "0x1a09d27e156f60208430bb654eb9ee36872e6c47bec143766e5e3552d705fc19",
      link: "https://evm.ngd.network/tx/0x1a09d27e156f60208430bb654eb9ee36872e6c47bec143766e5e3552d705fc19",
      amount: 10,
    },
    {
      hash: "0x58a5490eaf8addd0b193fe79834734f6cb32314903336bc32b94d3fcdb790681",
      link: "https://evm.ngd.network/tx/0x58a5490eaf8addd0b193fe79834734f6cb32314903336bc32b94d3fcdb790681",
      amount: 2,
    },
  ];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <View style={styles.transactionsView}>
        {data.map((item, index) => {
          return (
            <View key={index} style={styles.hashContainer}>
              {index % 2 === 0 ? <Text style={styles.hash}>{item.hash}</Text> : <Text style={styles.hash2}>{item.hash}</Text>}
              {/* <Text style={styles.hash}>{item.hash}</Text> */}
              {/* <Text style={styles.hashAmount}>${item.amount}</Text> */}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: 'grey'
  },
  container: {
    flex: 1,
    padding: 10,
    marginTop: 10,
    gap: 10,
    width: "100%",
  },
  transactionsView: {
    flex: 1,
    width: "100%",
  },
  hashContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 10,
    paddingBottom: 10,
    width: "100%",
  },
  hash: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#01AE92"
  },
  hash2: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "red"
  },
  hashAmount: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "#01AE92"
  },
});
