import { Link, useRouter } from "expo-router";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Index() {

    const router = useRouter();
    return (
    <View style={styles.container}>
      <Text style={styles.title}>NAIVEES</Text>
      <Image source={require('../../assets/images/IconBet.png')} style={styles.Logo} />
      <Text style={styles.text}>Intruduce tu nombre de usuario </Text>
      <TextInput style={styles.input}></TextInput>
      <Text style={styles.text}>Contraseña</Text>
      <TextInput style={styles.input}></TextInput>
        <Text style={styles.text}>Escribe tu contraseña otra vez</Text>
      <TextInput style={styles.input}></TextInput>
      <TouchableOpacity style={styles.buttonlogin}>
        <Text style={styles.text}>Registrate</Text>
      </TouchableOpacity>
      <Text style={styles.descrition}>¿Ya tienes cuenta? </Text>
      <TouchableOpacity style={styles.buttonlogin}>
        <Link href="/(Auth)/login" asChild>
          <Text style={styles.text}>Inicia sesion aqui</Text>
        </Link>
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