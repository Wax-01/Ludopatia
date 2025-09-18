import { AuthProvider } from "@/contexts/AuthContext";
import { Stack } from "expo-router";

export default function RootLayout() { 
  return <AuthProvider>  
    <Stack 
  screenOptions={{headerShown: false}}>
    <Stack.Screen name="index" options={{headerShown: false}} />
    <Stack.Screen name="(Auth)" options={{headerShown: false}} />
    <Stack.Screen name="main" options={{headerShown: false}} /> 
    <Stack.Screen name="UpdateForm" options={{headerShown: false}} />
        <Stack.Screen name="Camera" options={{headerShown: false}} />
  </Stack>;
  </AuthProvider>
}
