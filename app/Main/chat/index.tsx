import { AuthContext } from "@/contexts/AuthContext";
import { DataContext } from '@/contexts/DataContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function Chat() {
    const [users, setUsers] = useState<any[]>([]);
    const [chats, setChats] = useState<any[]>([]);
    const { getUsers, getChats, createChat } = useContext(DataContext);
    const { user } = useContext(AuthContext); // <--- Aquí obtienes el usuario actual
    const router = useRouter();

    useEffect(() => {
        if (user) {
            initProfiles();
            initChats();
        }
    }, [user]);

    const initProfiles = async () => {
        try {
            const response = await getUsers();
            if (!user || !user.id) {
                setUsers(response); // Muestra todos si no hay usuario autenticado
            } else {
                setUsers(response.filter((value: any) => value.id !== user.id));
            }
        } catch (error) {
            console.log(error);
        }
    };

    const initChats = async () => {
        try {
            const response = await getChats();
            setChats(response);
        } catch (error) {
            console.log(error);
        }
    };

    const handleGoToChat = async (payload: { chatId?: string, userId?: string }) => {
        if (payload.chatId) {
            router.navigate({
                pathname: "/Main/chat/Chats/[id]",
                params: { id: payload.chatId }
            });
        } else if (payload.userId) {
            try {
                const result = await createChat(user.id, payload.userId);
                if (result.chat) {
                    router.navigate({
                        pathname: "/Main/chat/Chats/[id]",
                        params: { id: result.chat.id }
                    });
                }
            } catch (error) {
                alert("Error al crear el chat");
            }
        }
    };

    const renderProfile = ({ item }: any) => (
        <TouchableOpacity
            style={styles.profileItem}
            onPress={() => handleGoToChat({ userId: item.id })}
        >
            <Image
                style={styles.profileAvatar}
                source={{ uri: item.avatar_url }}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={1000}
            />
            <Text style={styles.profileName}>{item.name}</Text>
            <AntDesign name="right" size={20} color="#fff" style={{ marginLeft: "auto" }} />
        </TouchableOpacity>
    );

    const renderChat = ({ item }: any) => {
        // Puedes personalizar cómo mostrar el nombre y avatar según tu estructura de chats
        const otherUser = item.user_id === user.id ? item.user1 : item.user;
        return (
            <TouchableOpacity style={styles.chatItem} onPress={() => handleGoToChat({ chatId: item.id })}>
                <Image source={{ uri: otherUser?.avatar_url }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                    <View style={styles.row}>
                        <Text style={styles.name}>{otherUser?.username || "Usuario"}</Text>
                        <Text style={styles.time}>
                            {item.messages && item.messages.length > 0
                                ? new Date(item.messages[item.messages.length - 1].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ""}
                        </Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.messages && item.messages.length > 0
                            ? item.messages[item.messages.length - 1].content
                            : "Sin mensajes"}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (!user) {
        return (
            <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "#fff" }}>Cargando usuario...</Text>
            </View>
        );
    }

    // Junta el header (Perfiles) y la lista de chats en un solo FlatList
    return (
        <FlatList
            data={chats}
            keyExtractor={item => item.id}
            renderItem={renderChat}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            style={{ backgroundColor: "#000" }}
            contentContainerStyle={styles.scrollContent}
            ListHeaderComponent={
                <>
                    <Text style={styles.title}>Perfiles</Text>
                    <FlatList
                        data={users}
                        keyExtractor={item => item.id}
                        renderItem={renderProfile}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 20, backgroundColor: "#000" }}
                        contentContainerStyle={{ gap: 10, paddingHorizontal: 10, backgroundColor: "#000" }}
                    />
                    <Text style={styles.title}>Chats</Text>
                </>
            }
        />
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingTop: 40,
        paddingBottom: 20,
    },
    title: {
        color: "white",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 18,
        marginLeft: 20,
    },
    profileItem: {
        backgroundColor: "#111",
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 10,
        minWidth: 180,
        borderWidth: 2,
        borderColor: "darkred",
    },
    profileAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        borderWidth: 2,
        borderColor: "darkred",
        backgroundColor: "#222",
    },
    profileName: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    chatItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: "#111",
        borderRadius: 12,
        marginHorizontal: 10,
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        marginRight: 16,
        borderWidth: 2,
        borderColor: "darkred",
        backgroundColor: "#222",
    },
    chatInfo: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    name: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    time: {
        color: "#aaa",
        fontSize: 14,
    },
    lastMessage: {
        color: "#ccc",
        fontSize: 15,
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: "#222",
        marginLeft: 90,
    },
});