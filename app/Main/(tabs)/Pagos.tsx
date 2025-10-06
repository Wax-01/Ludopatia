import LottieView from '@/components/Lottie';
import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";


export default function Pagos() {
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTransactions();
    }
  }, [user]);

  const fetchBalance = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();
    if (!error && data) setBalance(data.points);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setTransactions(data);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Wallet</Text>
      <Text style={styles.balanceLabel}>Saldo actual:</Text>
      <Text style={styles.balance}>
        {balance !== null ? `$${balance}` : ""}
      </Text>
      {loading && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <LottieView />
        </View>
      )}
      {!loading && (
        <>
          <Text style={styles.historyTitle}>Historial de movimientos</Text>
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.transactionItem}>
                <Text style={{ color: item.amount >= 0 ? "green" : "red" }}>
                  {item.amount >= 0 ? "+" : ""}
                  {item.amount}
                </Text>
                <Text style={styles.type}>{item.type}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: "#fff", textAlign: "center" }}>Sin movimientos</Text>}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  balanceLabel: { color: "#aaa", fontSize: 16 },
  balance: { fontSize: 32, color: "darkred", fontWeight: "bold", marginBottom: 20 },
  historyTitle: { color: "#fff", fontSize: 20, marginVertical: 16 },
  transactionItem: { backgroundColor: "#181818", padding: 12, borderRadius: 10, marginBottom: 10 },
  type: { color: "#fff", fontWeight: "bold" },
  date: { color: "#aaa", fontSize: 12 },
  desc: { color: "#ccc", fontSize: 13, marginTop: 2 },
});