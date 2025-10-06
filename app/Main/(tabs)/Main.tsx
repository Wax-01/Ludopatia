import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const tiposApuestas = [
  { id: "1", nombre: "Carreras de caballos", icon: "horse", imagen: require("../../../assets/images/caballos.jpeg") },
  { id: "2", nombre: "Tragaperras", icon: "dice", imagen: require("../../../assets/images/tragaperras.jpeg") },
  { id: "3", nombre: "Ruleta", icon: "ellipse", imagen: require("../../../assets/images/ruleta.jpeg") },
  { id: "4", nombre: "Poker", icon: "card", imagen: require("../../../assets/images/poker.jpg") },
  { id: "5", nombre: "Blackjack", icon: "card-outline", imagen: require("../../../assets/images/blackjack.jpeg") },
  { id: "6", nombre: "Bingo", icon: "grid", imagen: require("../../../assets/images/bingo.jpeg") },
];

function getTipoIcon(tipo: string) {
  switch (tipo) {
    case "horse":
      return <Ionicons name="paw" size={32} color="#fff" />;
    case "dice":
      return <Ionicons name="dice" size={32} color="#fff" />;
    case "ellipse":
      return <Ionicons name="ellipse" size={32} color="#fff" />;
    case "card":
      return <Ionicons name="card" size={32} color="#fff" />;
    case "card-outline":
      return <Ionicons name="card-outline" size={32} color="#fff" />;
    case "grid":
      return <Ionicons name="grid" size={32} color="#fff" />;
    default:
      return <Ionicons name="help" size={32} color="#fff" />;
  }
}

export default function Main() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>NAIVEES</Text>
        {/* Partido destacado */}
        <View style={styles.partido}>
          <Text style={styles.tituloPartido}>Apuesta en el partido</Text>
          <View style={styles.equipos}>
            <Image
              source={require("../../../assets/images/Madrid.jpeg")}
              style={styles.logoEquipo}
            />
            <Text style={styles.vs}>VS</Text>
            <Image
              source={require("../../../assets/images/Barcelona.png")}
              style={styles.logoEquipo}
            />
          </View>
          {/* Resultado parcial */}
          <Text style={styles.resultadoPartido}>2 - 1 | 23 minutos</Text>
          <Text style={styles.infoPartido}>Real Madrid vs Barcelona</Text>
          <TouchableOpacity style={styles.botonApostar}>
            <Text style={styles.textoBoton}>Apostar</Text>
          </TouchableOpacity>
        </View>

        {/* Oferta */}
        <View style={styles.oferta}>
          <Ionicons
            name="gift"
            size={32}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.textoOferta}>¡Oferta! Click aqui para ganar 10$</Text>
        </View>

        {/* Botón para ir a chats */}
        <TouchableOpacity
          style={styles.botonChat}
          onPress={() => router.push("/Main/chat")}
        >
          <Ionicons name="chatbubbles" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.textoBoton}>Ir a chats</Text>
        </TouchableOpacity>

        {/* Tipos de apuestas */}
        <Text style={styles.tituloApuestas}>Tipos de apuestas</Text>
        <View style={styles.apuestasScroll}>
          <FlatList
            data={tiposApuestas}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item }) => (
              <View style={styles.cuadroApuesta}>
                <Image source={item.imagen} style={styles.imagenApuesta} />
                <Text style={styles.textoApuesta}>{item.nombre}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#000",
    alignItems: "center",
    paddingBottom: 30,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    top: 10,
    marginBottom: 20,
  },
  container: {
    width: "100%",
    alignItems: "center",
    paddingTop: 30,
  },
  partido: {
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
    width: "90%",
    borderWidth: 2,
    borderColor: "darkred",
  },
  tituloPartido: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  equipos: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logoEquipo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  vs: {
    color: "white",
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: "bold",
  },
  resultadoPartido: {
    color: "gold",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoPartido: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  botonApostar: {
    backgroundColor: "darkred",
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 5,
  },
  textoBoton: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  oferta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "gold",
    width: "90%",
  },
  textoOferta: {
    color: "gold",
    fontSize: 16,
    fontWeight: "bold",
  },
  botonChat: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "darkred",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginBottom: 20,
    marginTop: 5,
  },
  tituloApuestas: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: "5%",
  },
  apuestasScroll: {
    height: 220,
    width: "90%",
  },
  cuadroApuesta: {
    backgroundColor: "#111",
    borderWidth: 2,
    borderColor: "darkred",
    borderRadius: 12,
    flex: 1,
    margin: 8,
    alignItems: "center",
    padding: 10,
    minWidth: 0,
  },
  imagenApuesta: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 5,
  },
  textoApuesta: {
    color: "white",
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
});