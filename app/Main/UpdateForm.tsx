import { AuthContext } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

export default function UpdateForm() {
  const { user, updateProfile } = useContext(AuthContext);
  const [nombre, setNombre] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [biografia, setBiografia] = useState(user?.bio || "");
  const [telefono, setTelefono] = useState(user?.phone || "");
  const [genero, setGenero] = useState(user?.gender || "");
  const router = useRouter();

  const handleUpdate = async () => {
    const result = await updateProfile({
      name: nombre,
      username: username,
      bio: biografia,
      phone: telefono,
      gender: genero,
    });
    if (result.success) {
      Alert.alert("TODO ESTA BIEN", ":D", [
        { text: "OK", onPress: () => router.push("/Main/(tabs)/Main") }
      ]);
    } else {
       Alert.alert("Perfil actualizado", ":D", [
        { text: "OK", onPress: () => router.push("/Main/(tabs)/Main") }
      ]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Tu nombre"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Usuario"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Biografía</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={biografia}
        onChangeText={setBiografia}
        placeholder="Cuéntanos sobre ti"
        placeholderTextColor="#aaa"
        multiline
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Teléfono"
        placeholderTextColor="#aaa"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Género</Text>
      <TextInput
        style={styles.input}
        value={genero}
        onChangeText={setGenero}
        placeholder="Ej: Femenino, Masculino, Otro"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity style={styles.buttonlogin} onPress={handleUpdate}>
        <Text style={styles.text}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
  },
  label: {
    color: "white",
    fontSize: 18,
    alignSelf: "flex-start",
    marginLeft: "10%",
    marginBottom: 5,
    marginTop: 15,
    fontStyle: "italic",
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    width: "80%",
    color: "white",
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#111",
  },
  buttonlogin: {
    backgroundColor: "darkred",
    padding: 12,
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
    marginTop: 30,
  },
  text: {
    fontSize: 20,
    color: "white",
  },
});