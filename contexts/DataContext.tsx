import { supabase } from "@/utils/supabase";
import { createContext, useEffect, useState } from "react";

interface DataContextProps {
    chats: any,
    getUsers: () => Promise<any[]>,
    getChats: () => Promise<any[]>,
    getSingleChat: (id: string) => any,
    createChat: (userId1: string, userId2: string) => Promise<any>,
    refreshChats: () => Promise<any[]>, // <--- Agrega esto
}

export const DataContext = createContext({} as DataContextProps);
// MessageContext
// ChatContext
// LoquequieranContext
// BETSCONTEXT


export const DataProvider = ({ children }: any) => {

    // Variables
    const [chats, setChats] = useState([] as any[]);


    // Funciones

    // LifeCycle components
    useEffect(() => {
        getUsers();
        getChats(); // <--- Agrega esto
    }, [])

    const getUsers = async () => {
        try {
            const { data, error } = await supabase.from("profiles").select("*");
            if (!error) {
                return data
            }

        } catch (error) {
            console.log(error)
        }

        return []
    }

    const getChats = async () => {
        try {
            const { data, error } = await supabase
                .from("chats")
                .select("*, user:user_id(*), user1:user_id2(*),messages(*)");

            if (!error) {
                setChats(data);
                return data
            }
        } catch (error) {
            console.log(error)
        }
        return []
    }

    const getSingleChat = (id: string) => {
        const chat = chats.find(value => value.id == id)
        return chat
    }

    const createChat = async (userId1: string, userId2: string) => {
        try {
            // Verifica si ya existe un chat entre estos dos usuarios
            const { data: existingChats, error: findError } = await supabase
                .from("chats")
                .select("*")
                .or(`and(user_id.eq.${userId1},user_id2.eq.${userId2}),and(user_id.eq.${userId2},user_id2.eq.${userId1})`);

            if (!findError && existingChats && existingChats.length > 0) {
                // Ya existe el chat, retorna el existente
                return { chat: existingChats[0], alreadyExists: true };
            }

            // Si no existe, crea el chat
            const { data, error } = await supabase
                .from("chats")
                .insert([
                    { user_id: userId1, user_id2: userId2 }
                ])
                .select()
                .single();

            if (error) {
                throw error;
            }

            // Opcional: actualiza el estado local
            setChats((prev) => [...prev, data]);

            return { chat: data, alreadyExists: false };
        } catch (error) {
            console.error("Error creando chat:", error);
            return { error };
        }
    };

    const refreshChats = async () => {
        return await getChats();
    };

    return <DataContext.Provider
        value={{
            chats,
            getUsers,
            getChats,
            getSingleChat,
            createChat,
            refreshChats, // <--- Agrega esto
        }}
    >
        {children}
    </DataContext.Provider>

}
