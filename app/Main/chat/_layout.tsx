import { DataProvider } from "@/contexts/DataContext";
import { Stack } from 'expo-router';
import React from 'react';

export default function ChatLayout() {
    return (
        <DataProvider>
            <Stack>
                <Stack.Screen name='index' options={{
                    title: "Chats",
                    headerShown: false
                }} />
                <Stack.Screen name='Chats/[id]' options={{
                    title: "Chat",
                    headerShown: false
                }} />
            </Stack>
        </DataProvider>
    )
}