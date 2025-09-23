import ModalCamera from "@/components/ModalCamera";
import { AuthContext } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const tarjetas = [
  { id: "1", nombre: "Visa **** 1234", tipo: "visa" },
  { id: "2", nombre: "Mastercard **** 5678", tipo: "mastercard" },
];

function getIcon(tipo: string) {
  if (tipo === "visa")
    return (
      <Ionicons
        name="card-outline"
        size={24}
        color="#1a1aff"
        style={{ marginRight: 10 }}
      />
    );
  if (tipo === "mastercard")
    return (
      <Ionicons
        name="card-outline"
        size={24}
        color="#ff5e00"
        style={{ marginRight: 10 }}
      />
    );
  return (
    <Ionicons
      name="card-outline"
      size={24}
      color="gray"
      style={{ marginRight: 10 }}
    />
  );
}

export default function Perfil() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);

  const handlePictureTaken = (base64: string) => {
    setProfileImageBase64(base64);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ModalCamera
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onPictureTaken={handlePictureTaken}
      />
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image
          source={
            profileImageBase64
              ? { uri: `data:image/jpeg;base64,${profileImageBase64}` }
              : require("../../../assets/images/profile.jpg")
          }
          style={styles.fotoPerfil}
        />
      </TouchableOpacity>

      <Text style={styles.nombre}>{user?.name || "Nombre no disponible"}</Text>
      <Text style={styles.label}>Username</Text>
      <Text style={styles.info}>{user?.username || "Sin username"}</Text>
      <Text style={styles.label}>Biografía</Text>
      <Text style={styles.info}>{user?.bio || "Sin biografía"}</Text>
      <Text style={styles.label}>Teléfono</Text>
      <Text style={styles.info}>{user?.phone || "Sin teléfono"}</Text>
      <Text style={styles.label}>Género</Text>
      <Text style={styles.info}>{user?.gender || "Sin género"}</Text>
      <Text style={styles.label}>Tarjetas usadas</Text>
      <FlatList
        data={tarjetas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            {getIcon(item.tipo)}
            <Text style={styles.tarjetaTexto}>{item.nombre}</Text>
          </View>
        )}
        style={styles.listaTarjetas}
      />
      <TouchableOpacity
        style={styles.buttonEdit}
        onPress={() => router.push("/Main/UpdateForm")}
      >
        <Text style={styles.buttonEditText}>Editar perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    paddingTop: 40,
  },
  fotoPerfil: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  nombre: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    color: "white",
    marginTop: 20,
    marginBottom: 5,
    fontStyle: "italic",
  },
  info: {
    fontSize: 16,
    color: "white",
    marginBottom: 10,
  },
  listaTarjetas: {
    width: "80%",
    marginTop: 10,
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "darkred",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  tarjetaTexto: {
    color: "white",
    fontSize: 16,
  },
  buttonEdit: {
    backgroundColor: "darkred",
    padding: 12,
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
    marginTop: 30,
  },
  buttonEditText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});