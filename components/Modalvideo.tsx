import { Ionicons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const videoSource =
  'https://wxgrdgiejvykrkadtgux.supabase.co/storage/v1/object/public/Videos/PierdeEltiempo.mp4';

export default function VideoScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  const openModal = () => {
    setModalVisible(true);
    player.play();
  };

  const closeModal = () => {
    player.pause();
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Botón estilizado para abrir el video */}
      <TouchableOpacity style={styles.openButton} onPress={openModal}>
        <Ionicons name="play-circle" size={24} color="#fff" />
        <Text style={styles.openButtonText}>Puente H girando</Text>
      </TouchableOpacity>

      {/* Modal con fondo oscuro */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          {/* Botón de cerrar en la esquina */}
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>

          {/* Video */}
          <View style={styles.videoContainer}>
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              contentFit="contain"
            />
          </View>

          {/* Controles */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                if (isPlaying) player.pause();
                else player.play();
              }}
            >
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={30} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#000',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'darkred',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    gap: 10,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)', // Fondo negro semi-transparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  videoContainer: {
    width: '90%',
    aspectRatio: 16 / 9, // Mantiene proporción del video
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    backgroundColor: 'darkred',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});