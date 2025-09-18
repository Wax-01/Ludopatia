import { AuthContext } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const context = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    const cleanEmail = email.trim();
      const cleanPassword = password.trim();
    const success = await context.login(cleanEmail, cleanPassword);
    if (success) {
      router.push("/Main/(tabs)/Main");
    } else {
      alert("Error al iniciar sesión. Revisa tus credenciales.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NAIVEES</Text>
      <Image source={require('../../assets/images/IconBet.png')} style={styles.Logo} />
      <Text style={styles.descrition}>La app para perd... Ganar dinero legalmente.</Text>
      <Text style={styles.text}>Usuario</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />
      <Text style={styles.text}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.buttonlogin} onPress={handleLogin}>
        <Text style={styles.text}>iniciar sesion</Text>
      </TouchableOpacity>

      <Text style={styles.descrition}>¿No tienes cuenta? Registrate</Text>
      <TouchableOpacity style={styles.buttonlogin}>
        <Text style={styles.text} onPress={() => router.push("/(Auth)/register")}>Registrate</Text>
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
    color: 'white',
    borderWidth: 1,
    width: '80%',
    height: 40,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderBlockColor: 'blue'
  }
})