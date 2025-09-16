import { AuthContext } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const context = useContext(AuthContext);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !repeatPassword) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }
    if (password !== repeatPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const result = await context.register(email, password);
    setLoading(false);
    if (result.success) {
      Alert.alert("¡Registro exitoso!", "Ahora puedes iniciar sesión.", [
        { text: "OK", onPress: () => router.push("/(Auth)/login") }
      ]);
    } else {
      Alert.alert("Error", result.error || "No se pudo registrar.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NAIVEES</Text>
      <Image source={require('../../assets/images/IconBet.png')} style={styles.Logo} />
      <Text style={styles.text}>Introduce tu correo electrónico</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Text style={styles.text}>Contraseña</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      <Text style={styles.text}>Repite tu contraseña</Text>
      <TextInput style={styles.input} value={repeatPassword} onChangeText={setRepeatPassword} secureTextEntry />
      <TouchableOpacity style={styles.buttonlogin} onPress={handleRegister} disabled={loading}>
        <Text style={styles.text}>{loading ? "Registrando..." : "Registrate"}</Text>
      </TouchableOpacity>
      <Text style={styles.descrition}>¿Ya tienes cuenta?</Text>
      <TouchableOpacity style={styles.buttonlogin} onPress={() => router.push("/(Auth)/login")}>
        <Text style={styles.text}>Inicia sesión aquí</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
     alignItems: "center",
  },
  blacktext:{
    color: 'black',
    fontSize: 20
  },
  buttonlogin:{
    backgroundColor: 'darkred',
    color: 'white',
    padding: 10,
    borderRadius: 10,
    width: '50%',
    alignItems: "center"
  }
  ,
  text:{
    fontSize: 20,
    justifyContent: "flex-start",
    color: 'white'
  },
  descrition:{
    fontSize: 15,
    fontStyle: "italic",
    color: 'white',
    marginTop: 20
  },
  Logo:{
    width: 100,
    height: 100,
    margin: 20
  },
  title:{
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
    color: 'white'
  },
  input:{
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    color: 'white',
    height: 40,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderBlockColor: 'blue'
  }
})