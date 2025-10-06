import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import * as ImagePicker from "expo-image-picker";
import { useContext, useEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Apuesta() {
  const { user } = useContext(AuthContext);
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Para crear apuesta (ADMIN)
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [multiplier, setMultiplier] = useState(""); // Nuevo estado
  const [image, setImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bet")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBets(data);
    setLoading(false);
  };

  // CLIENT: Unirse a apuesta
  const joinBet = async (betId: string) => {
    const { error } = await supabase.from("user_bet").insert([
      { user_id: user.id, bet_id: betId }
    ]);
    if (!error) {
      Alert.alert("¡Listo!", "Te has unido a la apuesta.");
    } else {
      Alert.alert("Error", "No se pudo unir a la apuesta.");
    }
  };

  // ADMIN: Crear apuesta
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `bets/${user.id}_${Date.now()}.jpg`;
    let { data, error } = await supabase.storage
      .from("bet-images")
      .upload(fileName, blob, { contentType: "image/jpeg" });
    setUploading(false);
    if (error) throw error;
    const { data: publicUrl } = supabase.storage
      .from("bet-images")
      .getPublicUrl(fileName);
    return publicUrl.publicUrl;
  };

  const createBet = async () => {
    if (!description || !cost || !multiplier) {
      Alert.alert("Completa todos los campos");
      return;
    }
    let imageUrl = null;
    if (image) {
      try {
        imageUrl = await uploadImage(image.uri);
      } catch (e) {
        Alert.alert("Error subiendo imagen");
        console.log(e);
        return;
      }
    }
    const { error } = await supabase.from("bet").insert([
      {
        description,
        cost: Number(cost),
        multiplier: Number(multiplier),
        image_url: imageUrl,
        created_by: user.id,
      },
    ]);
    if (!error) {
      setDescription("");
      setCost("");
      setMultiplier("");
      setImage(null);
      fetchBets();
      Alert.alert("Apuesta creada");
    } else {
      Alert.alert("Error creando apuesta");
    }
  };

  if (!user) {
    return <View style={styles.container}><Text style={{ color: "#fff" }}>Cargando usuario...</Text></View>;
  }

  // CLIENT: Mostrar apuestas vigentes
  if (user.Role === "CLIENT") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Apuestas Vigentes</Text>
        {loading ? (
          <Text style={{ color: "#fff" }}>Cargando...</Text>
        ) : (
          <FlatList
            data={bets}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.betItem}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.betImage} />
                ) : null}
                <Text style={styles.betDesc}>{item.description}</Text>
                <Text style={styles.betCost}>Costo: ${item.cost}</Text>
                <Text style={styles.betMultiplier}>Multiplicador: x{item.multiplier}</Text>
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => joinBet(item.id)}
                >
                  <Text style={{ color: "#fff" }}>Unirse</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: "#fff" }}>No hay apuestas disponibles.</Text>}
          />
        )}
      </View>
    );
  }

  // ADMIN: Crear apuesta
  if (user.Role === "ADMIN") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Crear Nueva Apuesta</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.betImage} />
          ) : (
            <Text style={{ color: "#fff" }}>Seleccionar imagen</Text>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Costo"
          placeholderTextColor="#aaa"
          value={cost}
          onChangeText={setCost}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Multiplicador (ej: 2.5)"
          placeholderTextColor="#aaa"
          value={multiplier}
          onChangeText={setMultiplier}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.createBtn}
          onPress={createBet}
          disabled={uploading}
        >
          <Text style={{ color: "#fff" }}>{uploading ? "Subiendo..." : "Crear apuesta"}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Apuestas creadas</Text>
        <FlatList
          data={bets}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.betItem}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.betImage} />
              ) : null}
              <Text style={styles.betDesc}>{item.description}</Text>
              <Text style={styles.betCost}>Costo: ${item.cost}</Text>
              <Text style={styles.betMultiplier}>Multiplicador: x{item.multiplier}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: "#fff" }}>No hay apuestas.</Text>}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  betItem: { backgroundColor: "#181818", padding: 12, borderRadius: 10, marginBottom: 15, alignItems: "center" },
  betImage: { width: 120, height: 120, borderRadius: 10, marginBottom: 10 },
  betDesc: { color: "#fff", fontSize: 16, marginBottom: 6, textAlign: "center" },
  betCost: { color: "darkred", fontWeight: "bold", marginBottom: 4 },
  betMultiplier: { color: "#fff", fontWeight: "bold", marginBottom: 8 },
  joinBtn: { backgroundColor: "darkred", padding: 10, borderRadius: 8 },
  createBtn: { backgroundColor: "darkred", padding: 12, borderRadius: 8, marginTop: 10, marginBottom: 20, alignItems: "center" },
  imagePicker: { backgroundColor: "#222", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  input: { backgroundColor: "#222", color: "#fff", borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 16 },
});