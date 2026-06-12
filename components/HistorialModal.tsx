import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface HistorialModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

interface BetHistory {
  id: string;
  bet_description: string;
  bet_image: string | null;
  amount_paid: number;
  prize_amount: number;
  net_result: number;
  result_status: 'pending' | 'won' | 'lost' | 'refunded';
  joined_at: string;
  completed_at: string | null;
  multiplier: number;
}

export default function HistorialModal({ visible, onClose, userId }: HistorialModalProps) {
  const [history, setHistory] = useState<BetHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');
  const [stats, setStats] = useState({
    totalWon: 0,
    totalLost: 0,
    totalPending: 0,
    winRate: 0,
  });

  useEffect(() => {
    if (visible) {
      fetchHistory();
    }
  }, [visible]);

  useEffect(() => {
    calculateStats();
  }, [history]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_bet_history')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const won = history.filter(h => h.result_status === 'won');
    const lost = history.filter(h => h.result_status === 'lost');
    const pending = history.filter(h => h.result_status === 'pending');

    const totalWon = won.reduce((sum, h) => sum + (h.net_result || 0), 0);
    const totalLost = Math.abs(lost.reduce((sum, h) => sum + (h.net_result || 0), 0));
    const totalPending = pending.reduce((sum, h) => sum + h.amount_paid, 0);
    
    const totalCompleted = won.length + lost.length;
    const winRate = totalCompleted > 0 ? (won.length / totalCompleted) * 100 : 0;

    setStats({ totalWon, totalLost, totalPending, winRate });
  };

  const getFilteredHistory = () => {
    if (filter === 'all') return history;
    return history.filter(h => h.result_status === filter);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'won':
        return { icon: 'trophy', color: '#4CAF50', text: 'Ganada' };
      case 'lost':
        return { icon: 'close-circle', color: '#f44336', text: 'Perdida' };
      case 'pending':
        return { icon: 'time', color: '#FFA726', text: 'Pendiente' };
      case 'refunded':
        return { icon: 'refresh', color: '#2196F3', text: 'Reembolsada' };
      default:
        return { icon: 'help-circle', color: '#999', text: 'Desconocido' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderHistoryItem = ({ item }: { item: BetHistory }) => {
    const statusInfo = getStatusInfo(item.result_status);
    
    return (
      <View style={styles.historyCard}>
        <View style={styles.cardHeader}>
          {item.bet_image ? (
            <Image source={{ uri: item.bet_image }} style={styles.betImage} />
          ) : (
            <View style={[styles.betImage, styles.noImage]}>
              <Ionicons name="image-outline" size={30} color="#666" />
            </View>
          )}
          
          <View style={styles.cardInfo}>
            <Text style={styles.betDescription} numberOfLines={2}>
              {item.bet_description}
            </Text>
            <Text style={styles.betDate}>{formatDate(item.joined_at)}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon as any} size={16} color="#fff" />
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Inversión:</Text>
            <Text style={styles.detailValue}>-{item.amount_paid} pts</Text>
          </View>

          {item.result_status === 'won' && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Premio:</Text>
                <Text style={[styles.detailValue, styles.prizeText]}>
                  +{item.prize_amount} pts
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ganancia neta:</Text>
                <Text style={[styles.detailValue, styles.netWin]}>
                  +{item.net_result} pts
                </Text>
              </View>
            </>
          )}

          {item.result_status === 'lost' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pérdida:</Text>
              <Text style={[styles.detailValue, styles.netLoss]}>
                {item.net_result} pts
              </Text>
            </View>
          )}

          {item.result_status === 'pending' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Premio potencial:</Text>
              <Text style={[styles.detailValue, styles.potentialPrize]}>
                {(item.amount_paid * item.multiplier).toFixed(0)} pts (x{item.multiplier})
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statusFooter}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header con botón de cerrar */}
        <View style={styles.modalHeader}>
          <Text style={styles.title}>Mi Historial</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Estadísticas generales */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>+{stats.totalWon}</Text>
              <Text style={styles.statLabel}>Ganado</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="trending-down" size={24} color="#f44336" />
              <Text style={styles.statValue}>-{stats.totalLost}</Text>
              <Text style={styles.statLabel}>Perdido</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#FFA726" />
              <Text style={styles.statValue}>{stats.totalPending}</Text>
              <Text style={styles.statLabel}>Pendiente</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="stats-chart" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{stats.winRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Efectividad</Text>
            </View>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pending' && styles.filterActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              Pendientes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'won' && styles.filterActive]}
            onPress={() => setFilter('won')}
          >
            <Text style={[styles.filterText, filter === 'won' && styles.filterTextActive]}>
              Ganadas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'lost' && styles.filterActive]}
            onPress={() => setFilter('lost')}
          >
            <Text style={[styles.filterText, filter === 'lost' && styles.filterTextActive]}>
              Perdidas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de historial */}
        <FlatList
          data={getFilteredHistory()}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchHistory}
              tintColor="#fff"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#666" />
              <Text style={styles.emptyText}>No hay historial disponible</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#0a0a0a',
  },
  closeButton: {
    padding: 5,
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#181818',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    backgroundColor: '#0a0a0a',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#181818',
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: 'darkred',
  },
  filterText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  historyCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  betImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  noImage: {
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  betDescription: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  betDate: {
    color: '#999',
    fontSize: 12,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#999',
    fontSize: 13,
  },
  detailValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  prizeText: {
    color: '#4CAF50',
  },
  netWin: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  netLoss: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  potentialPrize: {
    color: '#FFA726',
  },
  statusFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
});