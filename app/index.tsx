import { Button, Image, StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <Button title="Press me" />
      <Image source={require('../assets/images/react-logo.png')} style={styles.Logo} />
      <Text style={styles.text}>Hola buenas</Text>
    </View>

    
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: "center",
     alignItems: "center",
  },
  text:{
    fontSize: 30,
    color: 'blue'
  },
  Logo:{
    width: 100,
    height: 100
  }
})