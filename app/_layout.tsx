import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack 
  screenOptions={{headerShown: false}}>
    <Stack.Screen name="index" options={{headerShown: false}} />
    <Stack.Screen name="(Auth)" options={{headerShown: false}} />
    <Stack.Screen name="main" options={{headerShown: false}} />
  </Stack>;
}
