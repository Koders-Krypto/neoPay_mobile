import "@ethersproject/shims";
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
} from "@web3modal/wagmi-react-native";
import { WagmiConfig } from "wagmi";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider } from "react-native-paper";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
// SCREENS
import Home from "./src/screens/home";
import Recieve from "./src/screens/recieve";
import QRScan from "./src/screens/qrScan";
import Login from "./src/screens/login";
import Swap from "./src/screens/swap";
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

// 1. Get projectId
const projectId = "ef10cdd2a0657035a33a647bbbb5188a";

// 2. Create config
const metadata = {
  name: "NeoPay",
  description: "Neo Pay",
  url: "https://neopaynetwork.com/",
  icons: ["https://neopaynetwork.com/neopay-icon.png"],
  redirect: {
    native: "exp://",
    universal: "exp://",
  },
};

const neo = {
  id: 2970385,
  name: "NeoEVM",
  network: "neo",
  nativeCurrency: {
    decimals: 18,
    name: "GAS",
    symbol: "GAS",
  },
  rpcUrls: {
    public: { http: ["https://neo-jsonrpc-wrapper.vercel.app/api/rpc"] },
    default: { http: ["https://neo-jsonrpc-wrapper.vercel.app/api/rpc"] },
  },
  blockExplorers: {
    etherscan: { name: "NeoEVMExplorer", url: "https://evm.ngd.network" },
    default: { name: "NeoEVMExplorer", url: "https://evm.ngd.network" },
  },
  contracts: {
    multicall3: {
      address: "0x53a942df46b7253c5aBDE42F39ffaDE279B2d32B",
      blockCreated: 992350,
    },
  },
};

const chains = [neo];

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
});

export default function App() {
  const [fontsLoaded] = useFonts({
    "Inter-Thin": require("./assets/font/Inter-Thin-BETA.otf"),
    "Inter-SemiBold": require("./assets/font/Inter-SemiBold.otf"),
    "Inter-Regular": require("./assets/font/Inter-Regular.otf"),
    "Inter-Medium": require("./assets/font/Inter-Medium.otf"),
    "Inter-Light": require("./assets/font/Inter-Light-BETA.otf"),
    "Inter-ExtraLight": require("./assets/font/Inter-ExtraLight-BETA.otf"),
    "Inter-ExtraBold": require("./assets/font/Inter-ExtraBold.otf"),
    "Inter-Bold": require("./assets/font/Inter-Bold.otf"),
    "Inter-Black": require("./assets/font/Inter-Black.otf"),
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      {fontsLoaded && (
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen
                name="Home"
                component={Home}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Recieve" component={Recieve} />
              <Stack.Screen
                name="QRScan"
                options={{ headerShown: false }}
                component={QRScan}
              />
              <Stack.Screen
                name="Swap"
                options={{ headerShown: false }}
                component={Swap}
              />
              <Stack.Screen
                name="Login"
                options={{
                  headerShown: false,
                }}
                component={Login}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      )}
      <Web3Modal />
      <Toast position='bottom' />
      <StatusBar style="dark" />
    </WagmiConfig>
  );
}
