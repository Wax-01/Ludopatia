import ModalReview from "@/components/Review";
import { AuthContext } from "@/contexts/AuthContext";
import { uploadBetPhoto } from "@/utils/helper";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useContext, useEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Apuesta() {
  const { user, updateProfile } = useContext(AuthContext);
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  // Para crear apuesta (ADMIN)
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [image, setImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [reviewsData, setReviewsData] = useState<Record<string, {
  avgRating: number,
  userRating: number | null,
  totalReviews: number
}>>({});

  // Para sistema de reseñas
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedBet, setSelectedBet] = useState<any>(null);

  useEffect(() => {
    fetchBets();
  }, []);

  const fetchBets = async () => {
  setLoading(true);
  const { data: betData, error: betError } = await supabase
    .from("bet")
    .select("*")
    .order("created_at", { ascending: false });

  if (betError) {
    console.error(betError);
    setLoading(false);
    return;
  }

  // Obtener reseñas
  const { data: reviewData, error: reviewError } = await supabase
    .from("reviews")
    .select("bet_id, user_id, rating");

  if (reviewError) {
    console.error(reviewError);
    setBets(betData);
    setLoading(false);
    return;
  }

  // Procesar reseñas → agrupar por apuesta
  const grouped: Record<string, {
    total: number;
    sum: number;
    userRating: number | null;
  }> = {};

  for (const r of reviewData) {
    if (!grouped[r.bet_id]) {
      grouped[r.bet_id] = { total: 0, sum: 0, userRating: null };
    }
    grouped[r.bet_id].total += 1;
    grouped[r.bet_id].sum += r.rating;
    if (r.user_id === user.id) grouped[r.bet_id].userRating = r.rating;
  }

  const stats: Record<string, {
    avgRating: number,
    userRating: number | null,
    totalReviews: number
  }> = {};

  Object.keys(grouped).forEach(betId => {
    const g = grouped[betId];
    stats[betId] = {
      avgRating: Number((g.sum / g.total).toFixed(1)),
      userRating: g.userRating,
      totalReviews: g.total
    };
  });

  setReviewsData(stats);
  setBets(betData);
  setLoading(false);
};

  
  // CLIENT: Unirse a apuesta con verificación de puntos
  const joinBet = async (bet: any) => {
    // 1. Verificar que el usuario tenga suficientes puntos
    if (user.points < bet.cost) {
      Alert.alert(
        "Puntos insuficientes",
        `Necesitas ${bet.cost} puntos para unirte a esta apuesta. Tienes ${user.points} puntos.`
      );
      return;
    }

    // 2. Verificar que no esté ya unido
    const { data: existingBet } = await supabase
      .from("user_bet")
      .select("*")
      .eq("user_id", user.id)
      .eq("bet_id", bet.id)
      .single();

    if (existingBet) {
      Alert.alert("Ya estás en esta apuesta", "Ya te has unido a esta apuesta anteriormente.");
      return;
    }

    // 3. Verificar que la apuesta esté abierta
    if (bet.status === "closed" || bet.status === "completed") {
      Alert.alert("Apuesta cerrada", "Esta apuesta ya no está aceptando participantes.");
      return;
    }

    try {
      // 4. Iniciar transacción: Restar puntos y unirse a la apuesta
      const newPoints = user.points - bet.cost;

      // Actualizar puntos del usuario en la tabla profiles
      const { error: pointsError } = await supabase
        .from("profiles")  // ← CAMBIADO de "users" a "profiles"
        .update({ points: newPoints })
        .eq("id", user.id);

      if (pointsError) throw pointsError;

      // Unirse a la apuesta
      const { error: joinError } = await supabase
        .from("user_bet")
        .insert([{
          user_id: user.id,
          bet_id: bet.id,
          amount_paid: bet.cost,
          joined_at: new Date().toISOString(),
        }]);

      if (joinError) {
        // Si falla, intentar revertir los puntos
        await supabase
          .from("profiles")  // ← CAMBIADO de "users" a "profiles"
          .update({ points: user.points })
          .eq("id", user.id);
        throw joinError;
      }

      // Actualizar el contexto local
      updateProfile({ points: newPoints });

      Alert.alert(
        "¡Éxito!",
        `Te has unido a la apuesta. Puntos restantes: ${newPoints}`
      );
      
    } catch (error) {
      console.error("Error al unirse a la apuesta:", error);
      Alert.alert("Error", "No se pudo completar la operación.");
    }
  };

  // ADMIN: Cerrar apuesta y declarar ganadores
  const closeBet = async (bet: any) => {
    Alert.alert(
      "Cerrar Apuesta",
      "¿Quieres cerrar esta apuesta y declarar ganadores?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Declarar Ganadores",
          onPress: () => declareWinners(bet, true)
        },
        {
          text: "Cerrar sin Ganadores",
          style: "destructive",
          onPress: () => declareWinners(bet, false)
        },
      ]
    );
  };

  const declareWinners = async (bet: any, hasWinners: boolean) => {
    try {
      if (hasWinners) {
        // Obtener todos los participantes
        const { data: participants, error: fetchError } = await supabase
          .from("user_bet")
          .select("user_id, amount_paid")
          .eq("bet_id", bet.id);

        if (fetchError) throw fetchError;

        if (!participants || participants.length === 0) {
          Alert.alert("Sin participantes", "No hay nadie en esta apuesta.");
          return;
        }

        // Calcular premio por usuario
        const prizePerUser = bet.cost * bet.multiplier;

        // Actualizar puntos de cada ganador y marcar como ganador
        for (const participant of participants) {
          const { data: userData } = await supabase
            .from("profiles")
            .select("points")
            .eq("id", participant.user_id)
            .single();

          if (userData) {
            const newPoints = userData.points + prizePerUser;
            
            await supabase
              .from("profiles")
              .update({ points: newPoints })
              .eq("id", participant.user_id);

            // Marcar como ganador en user_bet
            await supabase
              .from("user_bet")
              .update({ 
                is_winner: true,
                prize_amount: prizePerUser
              })
              .eq("user_id", participant.user_id)
              .eq("bet_id", bet.id);
          }
        }

        // Marcar apuesta como completada con ganadores
        await supabase
          .from("bet")
          .update({ 
            status: "completed",
            completed_at: new Date().toISOString(),
            has_winners: true
          })
          .eq("id", bet.id);

        Alert.alert(
          "¡Ganadores declarados!",
          `Cada participante recibió ${prizePerUser} puntos.`
        );
      } else {
        // Cerrar sin ganadores - devolver puntos y marcar como perdedores
        const { data: participants } = await supabase
          .from("user_bet")
          .select("user_id, amount_paid")
          .eq("bet_id", bet.id);

        if (participants) {
          for (const participant of participants) {
            const { data: userData } = await supabase
              .from("profiles")
              .select("points")
              .eq("id", participant.user_id)
              .single();

            if (userData) {
              await supabase
                .from("profiles")
                .update({ points: userData.points + participant.amount_paid })
                .eq("id", participant.user_id);
            }

            // Marcar como NO ganador (perdedor)
            await supabase
              .from("user_bet")
              .update({ 
                is_winner: false,
                prize_amount: 0
              })
              .eq("user_id", participant.user_id)
              .eq("bet_id", bet.id);
          }
        }

        await supabase
          .from("bet")
          .update({ 
            status: "cancelled",
            completed_at: new Date().toISOString(),
            has_winners: false
          })
          .eq("id", bet.id);

        Alert.alert("Apuesta cancelada", "Se devolvieron los puntos a todos los participantes.");
      }

      fetchBets();
    } catch (error) {
      console.error("Error al cerrar apuesta:", error);
      Alert.alert("Error", "No se pudo completar la operación.");
    }
  };

  // CLIENT: Abrir modal de reseña
  const openReviewModal = (bet: any) => {
    setSelectedBet(bet);
    setReviewModalVisible(true);
  };

  // ADMIN: Seleccionar imagen
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64
      });
    }
  };

  const uploadImage = async (base64: string) => {
    if (!user?.id) throw new Error("Usuario no autenticado");
    const url = await uploadBetPhoto(base64, user.id);
    return url;
  };

  const createBet = async () => {
    if (!description || !cost || !multiplier) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    let imageUrl = null;
    
    if (image?.base64) {
      try {
        setUploading(true);
        imageUrl = await uploadImage(image.base64);
        setUploading(false);
      } catch (e) {
        setUploading(false);
        Alert.alert("Error", "No se pudo subir la imagen");
        console.error(e);
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
        status: "open", // Nueva apuesta siempre abierta
      },
    ]);

    if (!error) {
      setDescription("");
      setCost("");
      setMultiplier("");
      setImage(null);
      fetchBets();
      Alert.alert("Éxito", "Apuesta creada correctamente");
    } else {
      Alert.alert("Error", "No se pudo crear la apuesta");
      console.error(error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff", fontSize: 18 }}>Cargando usuario...</Text>
      </View>
    );
  }

  // CLIENT: Mostrar apuestas vigentes
  if (user.role === "CLIENT") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Apuestas Vigentes</Text>
          <View style={styles.pointsContainer}>
            <Ionicons name="wallet" size={20} color="#FFD700" />
            <Text style={styles.pointsText}>{user.points || 0} pts</Text>
          </View>
        </View>
        
        {selectedBet && (
          <ModalReview
            visible={reviewModalVisible}
            onClose={() => setReviewModalVisible(false)}
            betId={selectedBet.id}
            betDescription={selectedBet.description}
            onReviewSubmitted={fetchBets}
          />
        )}

        {loading ? (
          <Text style={{ color: "#fff" }}>Cargando...</Text>
        ) : (
          <FlatList
  data={bets.filter(b => b.status === "open")}
  keyExtractor={item => item.id}
  renderItem={({ item }) => {
    const stats = reviewsData[item.id] || { avgRating: 0, userRating: null, totalReviews: 0 };
    return (
      <View style={styles.betItem}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.betImage} />
        )}

        <Text style={styles.betDesc}>{item.description}</Text>

        {/* 🔥 Mostrar información de reseñas */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 }}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={{ color: "#FFD700" }}>
            {stats.avgRating ? `${stats.avgRating} / 5` : "Sin calificación"}
          </Text>
          <Text style={{ color: "#888" }}>({stats.totalReviews} votos)</Text>
        </View>

        {stats.userRating !== null && (
          <Text style={{ color: "#aaa", marginBottom: 8 }}>
            Tu calificación: ⭐ {stats.userRating}
          </Text>
        )}

        <Text style={styles.betCost}>Costo: {item.cost} puntos</Text>
        <Text style={styles.betMultiplier}>
          Premio: {(item.cost * item.multiplier).toFixed(0)} puntos (x{item.multiplier})
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.joinBtn,
              user.points < item.cost && styles.joinBtnDisabled
            ]}
            onPress={() => joinBet(item)}
            disabled={user.points < item.cost}
          >
            <Text style={styles.buttonTextSmall}>
              {user.points < item.cost ? "Sin puntos" : "Unirse"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => openReviewModal(item)}
          >
            <Ionicons name="star-outline" size={16} color="#fff" />
            <Text style={styles.buttonTextSmall}>Reseña</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }}
/>

        )}
      </View>
    );
  }

  // ADMIN: Crear y gestionar apuestas
  if (user.role === "ADMIN") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Crear Nueva Apuesta</Text>
        
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.betImage} />
          ) : (
            <Text style={{ color: "#fff" }}>📷 Seleccionar imagen</Text>
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
          placeholder="Costo en puntos"
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
          style={[styles.createBtn, uploading && styles.createBtnDisabled]}
          onPress={createBet}
          disabled={uploading}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {uploading ? "Subiendo..." : "Crear apuesta"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>Gestionar Apuestas</Text>
        
        <FlatList
          data={bets}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.betItem}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.betImage} />
              ) : null}
              
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {item.status === "open" ? "🟢 Abierta" : 
                   item.status === "completed" ? "✅ Completada" : "❌ Cancelada"}
                </Text>
              </View>
              
              <Text style={styles.betDesc}>{item.description}</Text>
              <Text style={styles.betCost}>Costo: {item.cost} puntos</Text>
              <Text style={styles.betMultiplier}>Multiplicador: x{item.multiplier}</Text>
              
              {item.status === "open" && (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => closeBet(item)}
                >
                  <Text style={styles.buttonTextSmall}>Cerrar Apuesta</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#fff" }}>No hay apuestas.</Text>
          }
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000", 
    padding: 20 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#fff", 
    marginBottom: 20 
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 10,
    borderRadius: 10,
    gap: 5,
  },
  pointsText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
  },
  betItem: { 
    backgroundColor: "#181818", 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 15, 
    alignItems: "center" 
  },
  betImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 10, 
    marginBottom: 10 
  },
  statusBadge: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  betDesc: { 
    color: "#fff", 
    fontSize: 16, 
    marginBottom: 6, 
    textAlign: "center" 
  },
  betCost: { 
    color: "darkred", 
    fontWeight: "bold", 
    marginBottom: 4 
  },
  betMultiplier: { 
    color: "#FFD700", 
    fontWeight: "bold", 
    marginBottom: 8 
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    justifyContent: "center",
  },
  joinBtn: { 
    backgroundColor: "darkred", 
    padding: 10, 
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  joinBtnDisabled: {
    backgroundColor: "#555",
    opacity: 0.5,
  },
  reviewBtn: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
  },
  closeBtn: {
    backgroundColor: "#ff6b00",
    padding: 10,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonTextSmall: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  createBtn: { 
    backgroundColor: "darkred", 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 10, 
    marginBottom: 20, 
    alignItems: "center" 
  },
  createBtnDisabled: {
    backgroundColor: "#555",
    opacity: 0.6
  },
  imagePicker: { 
    backgroundColor: "#222", 
    padding: 20, 
    borderRadius: 8, 
    alignItems: "center", 
    marginBottom: 10,
    minHeight: 150,
    justifyContent: "center"
  },
  input: { 
    backgroundColor: "#222", 
    color: "#fff", 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 10, 
    fontSize: 16 
  },
});