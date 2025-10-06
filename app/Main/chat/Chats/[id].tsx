import { AuthContext } from '@/contexts/AuthContext';
import { DataContext } from '@/contexts/DataContext';
import { supabase } from '@/utils/supabase';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function ChatDetails() {
    const { id } = useLocalSearchParams();
    const { getSingleChat, refreshChats } = useContext(DataContext); // refreshChats debe estar en tu contexto
    const { user } = useContext(AuthContext);
    const chat = getSingleChat(id as string);
    const [input, setInput] = useState('');
    const navigation = useNavigation();
    const scrollViewRef = useRef<ScrollView>(null);

    // Determina el otro usuario del chat
    const otherUser = user && chat
        ? (chat.user.id === user.id ? chat.user1 : chat.user)
        : null;

    const title = otherUser?.name || "Chat";

    // RealTime listener
    useEffect(() => {
        const channel = supabase
            .channel(id as string)
            .on('postgres_changes', { event: "*", schema: "public", table: "messages" },
                (payload) => {
                    console.log("Nuevo mensaje recibido por realtime:", payload.new);
                    refreshChats && refreshChats(); // Actualiza los chats en el contexto
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, []);

    useEffect(() => {
        navigation.setOptions?.({ title });
    }, [title]);

    // Scroll al final cuando llegan mensajes nuevos
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [chat?.messages]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;
        const { error } = await supabase.from('messages').insert([{
            chat_id: id,
            sent_by: user.id,
            text: input.trim(),
        }]);
        if (error) {
            console.error("Error al enviar mensaje:", error);
            alert("Error al enviar mensaje: " + error.message);
        } else {
            setInput('');
            refreshChats && refreshChats(); // Actualiza los chats en el contexto
        }
    };

    const getMessageSender = (sentBy: string) => {
        if (!user) return null;
        if (sentBy === user.id) return user;
        return otherUser;
    };

    const isCurrentUserMessage = (sentBy: string) => {
        return user && sentBy === user.id;
    };

    if (!user) {
        return (
            <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#fff" }}>Cargando usuario...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={90}
        >
            <ScrollView
                style={styles.messagesContainer}
                ref={scrollViewRef}
                contentContainerStyle={{ paddingBottom: 80 }}
            >
                {(chat?.messages ?? []).map((message: {
                    id: string;
                    sent_by: string;
                    text: string;
                    
                }) => {
                    const isOwn = isCurrentUserMessage(message.sent_by);
                    const sender = getMessageSender(message.sent_by);
                    return (
                        <View
                            key={message.id}
                            style={[
                                styles.messageWrapper,
                                isOwn ? styles.ownMessage : styles.otherMessage,
                            ]}
                        >
                            {!isOwn && sender && (
                                <Image
                                    source={{ uri: sender.avatar_url }}
                                    style={styles.avatar}
                                    placeholder={{ blurhash }}
                                    contentFit="cover"
                                    transition={1000}
                                />
                            )}
                            <View
                                style={[
                                    styles.messageBubble,
                                    isOwn ? styles.ownBubble : styles.otherBubble,
                                ]}
                            >
                                {!isOwn && sender && (
                                    <Text style={styles.senderName}>{sender.name}</Text>
                                )}
                                <Text
                                    style={[
                                        styles.messageText,
                                        isOwn ? styles.ownText : styles.otherText,
                                    ]}
                                >
                                    {message.text}
                                </Text>
                            </View>
                            {isOwn && sender && (
                                <Image
                                    source={{ uri: sender.avatar_url }}
                                    style={styles.avatar}
                                    placeholder={{ blurhash }}
                                    contentFit="cover"
                                    transition={1000}
                                />
                            )}
                        </View>
                    );
                })}
            </ScrollView>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Escribe un mensaje...."
                    placeholderTextColor="#aaa"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Text style={styles.sendButtonText}>Enviar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    messagesContainer: {
        flex: 1,
        padding: 16,
    },
    messageWrapper: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "flex-end",
    },
    ownMessage: {
        justifyContent: "flex-end",
    },
    otherMessage: {
        justifyContent: "flex-start",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 8,
        borderWidth: 2,
        borderColor: "darkred",
        backgroundColor: "#222",
    },
    messageBubble: {
        maxWidth: "70%",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
    },
    ownBubble: {
        backgroundColor: "#007AFF",
    },
    otherBubble: {
        backgroundColor: "#222",
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    ownText: {
        color: "#FFFFFF",
    },
    otherText: {
        color: "#fff",
    },
    senderName: {
        fontSize: 12,
        fontWeight: "600",
        color: "#aaa",
        marginBottom: 4,
    },
    inputContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#111",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: "#222",
        marginBottom: 40,
    },
    input: {
        flex: 1,
        backgroundColor: "#222",
        color: "#fff",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: "darkred",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 18,
    },
    sendButtonText: {
        color: "#ffffffff",
        fontWeight: "bold",
        fontSize: 16,
    },
});