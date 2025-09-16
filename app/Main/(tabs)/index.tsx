import { Ionicons } from "@expo/vector-icons";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

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
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/profile.jpg")}
        style={styles.fotoPerfil}
      />
      <Text style={styles.nombre}>Julian Aguilar</Text>
      <Text style={styles.label}>Fecha de nacimiento</Text>
      <Text style={styles.info}>12/05/2002</Text>
      <Text style={styles.label}>Saldo actual:</Text>
      <Text style={styles.info}>120$</Text>
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
});