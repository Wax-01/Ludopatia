import LottieView from "@/components/Lottie";
import { AuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Review {
  id: string;
  user_id: string;
  bet_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface ModalReviewProps {
  visible: boolean;
  onClose: () => void;
  betId: string;
  betDescription: string;
  onReviewSubmitted?: () => void;
}

export default function ModalReview({
  visible,
  onClose,
  betId,
  betDescription,
  onReviewSubmitted,
}: ModalReviewProps) {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar reseñas existentes
  const loadReviews = async () => {
    if (!visible) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("bet_id", betId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
      Alert.alert("Error", "No se pudieron cargar las reseñas");
    } finally {
      setLoading(false);
    }
  };

  // Cargar reseñas cuando el modal se abre
  useEffect(() => {
    if (visible) {
      loadReviews();
      
      // Cargar la reseña del usuario actual si existe
      if (user) {
        loadUserReview();
      }
    }
  }, [visible, betId, user]);

  // Cargar la reseña del usuario actual para edición
  const loadUserReview = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("bet_id", betId)
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setRating(data.rating);
        setComment(data.comment);
      }
    } catch (error) {
      console.error("Error al cargar reseña del usuario:", error);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Por favor selecciona una calificación");
      return;
    }

    if (!comment.trim()) {
      Alert.alert("Error", "Por favor escribe un comentario");
      return;
    }

    setSubmitting(true);

    try {
      // Verificar si ya existe una reseña
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user?.id)
        .eq("bet_id", betId)
        .single();

      if (existingReview) {
        // Actualizar reseña existente
        const { error } = await supabase
          .from("reviews")
          .update({ 
            rating, 
            comment: comment.trim(), 
            updated_at: new Date().toISOString() 
          })
          .eq("id", existingReview.id);

        if (error) throw error;
        Alert.alert("Éxito", "Tu reseña ha sido actualizada");
      } else {
        // Crear nueva reseña
        const { error } = await supabase.from("reviews").insert([
          {
            user_id: user?.id,
            bet_id: betId,
            rating,
            comment: comment.trim(),
          },
        ]);

        if (error) throw error;
        Alert.alert("Éxito", "Tu reseña ha sido enviada");
      }

      // Recargar reseñas
      await loadReviews();
      onReviewSubmitted?.();
    } catch (error) {
      console.error("Error al enviar reseña:", error);
      Alert.alert("Error", "No se pudo enviar la reseña");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  // Función para renderizar estrellas
  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.reviewStarsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={size}
            color={star <= rating ? "#FFD700" : "#666"}
          />
        ))}
      </View>
    );
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Obtener nombre abreviado del usuario
  const getUserDisplayName = (userId: string) => {
    if (user && userId === user.id) {
      return "Tú";
    }
    // Si no tienes tabla de perfiles, usamos un ID abreviado
    return `Usuario ${userId.substring(0, 6)}...`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Reseñas</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Descripción de la apuesta */}
            <Text style={styles.betDescription}>{betDescription}</Text>

            {/* SECCIÓN: Reseñas existentes */}
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>
                Reseñas ({reviews.length})
              </Text>
              
              {loading ? (
                <LottieView></LottieView>
              ) : reviews.length === 0 ? (
                <Text style={styles.noReviewsText}>
                  Aún no hay reseñas para esta apuesta
                </Text>
              ) : (
                <View style={styles.reviewsList}>
                  {reviews.map((review) => (
                    <View key={review.id} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewUserInfo}>
                          <Text style={styles.userName}>
                            {getUserDisplayName(review.user_id)}
                          </Text>
                          <Text style={styles.reviewDate}>
                            {formatDate(review.created_at)}
                            {review.updated_at !== review.created_at && " (editado)"}
                          </Text>
                        </View>
                        {renderStars(review.rating)}
                      </View>
                      <Text style={styles.reviewComment}>
                        {review.comment}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* SECCIÓN: Dejar reseña */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>
                {reviews.some(r => r.user_id === user?.id) ? "Editar tu reseña" : "Deja tu reseña"}
              </Text>

              {/* Calificación con estrellas */}
              <Text style={styles.label}>Calificación</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={40}
                      color={star <= rating ? "#FFD700" : "#666"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Texto descriptivo de la calificación */}
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 1 && "😞 Muy mala"}
                  {rating === 2 && "😕 Mala"}
                  {rating === 3 && "😐 Regular"}
                  {rating === 4 && "😊 Buena"}
                  {rating === 5 && "🤩 Excelente"}
                </Text>
              )}

              {/* Comentario */}
              <Text style={styles.label}>Comentario</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Cuéntanos tu experiencia con esta apuesta..."
                placeholderTextColor="#666"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {comment.length}/500 caracteres
              </Text>

              {/* Botones */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    submitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>
                    {submitting 
                      ? "Enviando..." 
                      : reviews.some(r => r.user_id === user?.id) 
                        ? "Actualizar reseña" 
                        : "Enviar reseña"
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  betDescription: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 20,
    fontStyle: "italic",
  },
  // Secciones
  reviewsSection: {
    marginBottom: 30,
  },
  formSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  // Estilos para la lista de reseñas
  reviewsList: {
    gap: 15,
  },
  reviewItem: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reviewUserInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: "#666",
  },
  reviewStarsContainer: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 14,
    color: "#ddd",
    lineHeight: 20,
  },
  loadingText: {
    color: "#aaa",
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 10,
  },
  noReviewsText: {
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 10,
  },
  // Estilos existentes del formulario
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    fontSize: 18,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  textArea: {
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 5,
  },
  characterCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#333",
  },
  submitButton: {
    backgroundColor: "darkred",
  },
  submitButtonDisabled: {
    backgroundColor: "#555",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});