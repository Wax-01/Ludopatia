import { supabase } from "@/utils/supabase";
import { createContext, useState } from "react";


interface AuthContextProps {
    user: any,
    isLoading: boolean,
    login: (email: string, password: string) => Promise<any>,
    register: (email: string, password: string) => Promise<{ success: boolean, error?: string }>,
    logout: () => void
}


export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: any) => {

    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            return false;
        }
        setUser(data.user);
        return true;
    };


    const register = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, user: data.user };
    }

    const logout = async () => {
        setUser(null);
    }

    return <AuthContext.Provider
        value={{
            user,
            isLoading,
            login,
            register,
            logout
        }}
    >
        {children}
    </AuthContext.Provider>
}


