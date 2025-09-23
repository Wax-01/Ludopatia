import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Button, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ModalCameraProps {
  modalVisible: boolean;
  setModalVisible: (v: boolean) => void;
  onPictureTaken: (base64: string) => void;
}

export default function ModalCamera({ modalVisible, setModalVisible, onPictureTaken }: ModalCameraProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [preview, setPreview] = useState<{ uri: string; base64: string } | null>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Tomar foto con la cámara
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });
      setPreview({ uri: photo.uri, base64: photo.base64 });
    }
  };

  // Elegir foto de la galería
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPreview({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64 || "",
      });
    }
  };

  // Aceptar la foto (cámara o galería)
  const acceptPhoto = () => {
    if (preview?.base64) {
      onPictureTaken(preview.base64);
      setPreview(null);
      setModalVisible(false);
    }
  };

  // Cancelar preview
  const cancelPreview = () => {
    setPreview(null);
  };

  return (
    <Modal
      style={styles.container}
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setPreview(null);
        setModalVisible(false);
      }}
    >
      <View style={styles.container}>
        {!preview ? (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                <Text style={styles.text}>Flip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.text}>Galería</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={takePicture}>
                <Text style={styles.text}>Tomar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                <Text style={styles.text}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Image source={{ uri: preview.uri }} style={styles.previewImage} />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={acceptPhoto}>
                <Text style={styles.text}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={cancelPreview}>
                <Text style={styles.text}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: "#000a",
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  button: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: "#222a",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  previewImage: {
    width: 300,
    height: 400,
    alignSelf: 'center',
    borderRadius: 20,
    marginVertical: 30,
  },
});
