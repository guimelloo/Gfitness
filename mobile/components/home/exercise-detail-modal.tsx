import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';
import { FontSizes, Spacing } from '@/constants/theme';
import { ExerciseGifService } from '@/services/exercise-gif-service';

interface ExerciseDetailModalProps {
  visible: boolean;
  exerciseName: string;
  sets: number;
  reps: string;
  note?: string;
  onClose: () => void;
}

export function ExerciseDetailModal({
  visible,
  exerciseName,
  sets,
  reps,
  note,
  onClose,
}: ExerciseDetailModalProps) {
  const [exerciseData, setExerciseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setImageError(false);
    setVideoLoading(true);

    ExerciseGifService.getExerciseMedia(exerciseName)
      .then(data => setExerciseData(data))
      .catch(() => setExerciseData(ExerciseGifService.findExerciseGif(exerciseName)))
      .finally(() => setLoading(false));

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [visible, exerciseName, pulseAnim]);

  const getEmbeddedVideoUrl = (url?: string | null): string | null => {
    if (!url) return null;
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}?playsinline=1&rel=0&modestbranding=1`;
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}?playsinline=1&rel=0&modestbranding=1`;
    return url;
  };

  const getMuscleLabel = (m: string) => {
    const map: Record<string, string> = {
      costas: 'Costas', peito: 'Peito', perna: 'Perna', biceps: 'Bíceps',
      triceps: 'Tríceps', core: 'Core', ombro: 'Ombro', posterior: 'Posterior',
    };
    return map[m?.toLowerCase()] ?? m;
  };

  const embeddedVideoUrl = getEmbeddedVideoUrl(exerciseData?.videoUrl);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="close" size={18} color="#475569" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={2}>{exerciseName}</Text>
            {exerciseData?.targetMuscle && (
              <Text style={styles.headerMuscle}>{getMuscleLabel(exerciseData.targetMuscle)}</Text>
            )}
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Media Area ── */}
          <View style={styles.mediaContainer}>
            {loading ? (
              <View style={styles.mediaCenter}>
                <ActivityIndicator size="large" color="#0f172a" />
                <Text style={styles.mediaLoadingText}>Carregando...</Text>
              </View>
            ) : embeddedVideoUrl ? (
              <View style={styles.videoBox}>
                {videoLoading && (
                  <View style={styles.videoOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                )}
                <WebView
                  source={{ uri: embeddedVideoUrl }}
                  style={styles.webview}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  onLoadStart={() => setVideoLoading(true)}
                  onLoadEnd={() => setVideoLoading(false)}
                />
              </View>
            ) : exerciseData?.gifUrl && !imageError ? (
              <Image
                source={exerciseData.gifUrl}
                style={styles.gif}
                contentFit="contain"
                cachePolicy="memory-disk"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.fallbackBox}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <MaterialCommunityIcons name="dumbbell" size={64} color="#cbd5e1" />
                </Animated.View>
                <Text style={styles.fallbackLabel}>{exerciseName}</Text>
                <Text style={styles.fallbackSub}>Siga as instruções abaixo para executar corretamente</Text>
              </View>
            )}
          </View>

          {/* ── Stats Row ── */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxValue}>{sets}</Text>
              <Text style={styles.statBoxLabel}>SÉRIES</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxDark]}>
              <Text style={[styles.statBoxValue, styles.statBoxValueLight]}>{reps}</Text>
              <Text style={[styles.statBoxLabel, styles.statBoxLabelLight]}>REPETIÇÕES</Text>
            </View>
            {exerciseData?.equipment && (
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="weight-lifter" size={20} color="#64748b" style={{ marginBottom: 2 }} />
                <Text style={styles.statBoxLabel} numberOfLines={1}>{exerciseData.equipment}</Text>
              </View>
            )}
          </View>

          {/* ── Technical Note ── */}
          {note && (
            <View style={styles.noteBox}>
              <View style={styles.noteTitleRow}>
                <MaterialCommunityIcons name="information-outline" size={15} color="#92400e" />
                <Text style={styles.noteTitle}>Dica Técnica</Text>
              </View>
              <Text style={styles.noteText}>{note}</Text>
            </View>
          )}

          {/* ── Instructions ── */}
          {exerciseData?.instructions?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="format-list-numbered" size={18} color="#0f172a" />
                <Text style={styles.sectionTitle}>Como Executar</Text>
              </View>
              {exerciseData.instructions.map((step: string, idx: number) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Fallback: no exerciseData but show sets/reps/note */}
          {!loading && !exerciseData && (
            <View style={styles.section}>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxValue}>{sets}</Text>
                  <Text style={styles.statBoxLabel}>SÉRIES</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxDark]}>
                  <Text style={[styles.statBoxValue, styles.statBoxValueLight]}>{reps}</Text>
                  <Text style={[styles.statBoxLabel, styles.statBoxLabelLight]}>REPETIÇÕES</Text>
                </View>
              </View>
              {note && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* ── Footer Button ── */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.footerBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: Spacing.sm,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: FontSizes.md, fontWeight: '800', color: '#0f172a',
    textAlign: 'center', lineHeight: 22,
  },
  headerMuscle: { fontSize: FontSizes.xs, color: '#94a3b8', fontWeight: '500', marginTop: 2 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.lg },

  // Media
  mediaContainer: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  mediaCenter: { alignItems: 'center', gap: Spacing.md },
  mediaLoadingText: { fontSize: FontSizes.sm, color: '#94a3b8' },
  videoBox: { width: '100%', height: '100%', backgroundColor: '#000' },
  webview: { flex: 1 },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gif: { width: '100%', height: '100%' },
  fallbackBox: {
    alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  fallbackLabel: {
    fontSize: FontSizes.md, fontWeight: '700', color: '#334155',
    textAlign: 'center', marginTop: Spacing.sm,
  },
  fallbackSub: {
    fontSize: FontSizes.sm, color: '#94a3b8',
    textAlign: 'center', lineHeight: 20,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.sm,
  },
  statBox: {
    flex: 1, backgroundColor: '#f8fafc', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9',
  },
  statBoxDark: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  statBoxValue: { fontSize: FontSizes.xl, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  statBoxValueLight: { color: '#fff' },
  statBoxLabel: { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8 },
  statBoxLabelLight: { color: 'rgba(255,255,255,0.5)' },

  // Note
  noteBox: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: '#fffbeb', borderRadius: 14, padding: Spacing.md,
    borderLeftWidth: 4, borderLeftColor: '#fbbf24', gap: 6,
  },
  noteTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  noteTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#92400e' },
  noteText: { fontSize: FontSizes.sm, color: '#78350f', lineHeight: 20 },

  // Instructions
  section: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: '800', color: '#0f172a' },
  stepRow: {
    flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, alignItems: 'flex-start',
  },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#0f172a',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  stepNumText: { fontSize: FontSizes.xs, fontWeight: '800', color: '#fff' },
  stepText: { flex: 1, fontSize: FontSizes.sm, color: '#334155', lineHeight: 22, paddingTop: 2 },

  // Footer
  footer: {
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  footerBtn: {
    backgroundColor: '#0f172a', borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  footerBtnText: { color: '#fff', fontSize: FontSizes.md, fontWeight: '700', letterSpacing: 0.3 },
});
