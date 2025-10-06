import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

export default function App() {
  const animation = useRef<LottieView>(null);
  useEffect(() => {
    // You can control the ref programmatically, rather than using autoPlay
    // animation.current?.play();
  }, []);

  return (
    <View style={styles.animationContainer}>
      <LottieView
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
        // Find more Lottie files at https://lottiefiles.com/featured
        source={require('../assets/lotties/Loader Payment Credit Card.json')}
      />
      <View style={styles.buttonContainer}>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: '#000000ff',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonContainer: {
    paddingTop: 20,
  },
});
