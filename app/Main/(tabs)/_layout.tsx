import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: 'gray',
                tabBarActiveBackgroundColor: 'darkred',
                tabBarStyle: {
                    backgroundColor: 'black',
                    borderTopWidth: 1,
                    borderTopColor: 'black',
                },
            }}
        >
            <Tabs.Screen
                name="Main"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}