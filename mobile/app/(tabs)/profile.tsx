import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { openURL } from 'expo-linking';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthContext } from '@/context/auth-context';
import { UserProfileService } from '@/services/user-profile-service';
import { WorkoutPlanService } from '@/services/workout-plan-service';
import { API_BASE_URL } from '@/services/api-config';

interface UserProfile {
  avatarUrl?: string | null;
  currentWeight?: number;
  targetWeightMin?: number;
  targetWeightMax?: number;
  height?: number;
  age?: number;
  gender?: string;
  caloriesTrainingDay: number;
  caloriesRestDay: number;
  proteinDaily: number;
  carbsTrainingDay: number;
  carbsRestDay: number;
  fatTrainingDay: number;
  fatRestDay: number;
  waterGoal: number;
}

function calcBMI(weight?: number, height?: number): number | null {
  if (!weight || !height) return null;
  return weight / Math.pow(height / 100, 2);
}

function calcBodyFat(weight?: number, height?: number, age?: number, gender?: string): number | null {
  if (!weight || !height || !age) return null;
  const bmi = calcBMI(weight, height);
  if (!bmi) return null;
  const sexFactor = gender === 'female' ? 0 : 1;
  const bf = (1.2 * bmi) + (0.23 * age) - (10.8 * sexFactor) - 5.4;
  return Math.max(2, Math.round(bf * 10) / 10);
}

function bfCategory(bf: number, gender?: string): { label: string; color: string } {
  const isMale = gender !== 'female';
  if (isMale) {
    if (bf < 6) return { label: 'Essencial', color: '#f59e0b' };
    if (bf < 14) return { label: 'Atleta', color: '#22c55e' };
    if (bf < 18) return { label: 'Fitness', color: '#3b82f6' };
    if (bf < 25) return { label: 'Aceitável', color: '#f97316' };
    return { label: 'Acima', color: '#ef4444' };
  }
  if (bf < 14) return { label: 'Essencial', color: '#f59e0b' };
  if (bf < 21) return { label: 'Atleta', color: '#22c55e' };
  if (bf < 25) return { label: 'Fitness', color: '#3b82f6' };
  if (bf < 32) return { label: 'Aceitável', color: '#f97316' };
  return { label: 'Acima', color: '#ef4444' };
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Abaixo do peso', color: '#f59e0b' };
  if (bmi < 25) return { label: 'Peso normal', color: '#22c55e' };
  if (bmi < 30) return { label: 'Sobrepeso', color: '#f97316' };
  return { label: 'Obesidade', color: '#ef4444' };
}

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [importingExcel, setImportingExcel] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const p = await UserProfileService.getUserProfile();
      setProfile(p);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUploadingAvatar(true);
      try {
        const { avatarUrl } = await WorkoutPlanService.uploadAvatar(
          asset.uri, asset.uri.split('/').pop() ?? 'avatar.jpg', asset.mimeType ?? 'image/jpeg',
        );
        setProfile(prev => prev ? { ...prev, avatarUrl } : null);
      } catch { Alert.alert('Erro', 'Não foi possível enviar a foto'); }
      finally { setUploadingAvatar(false); }
    }
  };

  const handleGenderToggle = async () => {
    const next = profile?.gender === 'female' ? 'male' : 'female';
    setProfile(prev => prev ? { ...prev, gender: next } : null);
    try { await UserProfileService.updateUserProfile({ gender: next }); }
    catch { Alert.alert('Erro', 'Não foi possível atualizar'); }
  };

  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      setImportingExcel(true);
      const data = await WorkoutPlanService.importExcel(
        asset.uri, asset.name ?? 'planilha.xlsx',
        asset.mimeType ?? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      Alert.alert('Concluído', `${data.workoutDaysImported} dias e ${data.mealsImported} refeições importados`);
    } catch (err: any) {
      Alert.alert('Erro', err?.message ?? 'Falha ao importar');
    } finally { setImportingExcel(false); }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza?', [
      { text: 'Cancelar' },
      { text: 'Sair', style: 'destructive', onPress: async () => { try { await logout(); } catch (e: any) { Alert.alert('Erro', e.message); } } },
    ]);
  };

  const avatarUri = profile?.avatarUrl ? `${API_BASE_URL}${profile.avatarUrl}` : null;
  const bmi = calcBMI(profile?.currentWeight, profile?.height);
  const bodyFat = calcBodyFat(profile?.currentWeight, profile?.height, profile?.age, profile?.gender);
  const bmiCat = bmi ? bmiCategory(bmi) : null;
  const bfCat = bodyFat !== null ? bfCategory(bodyFat!, profile?.gender) : null;

  if (loading) {
    return <View style={S.loadScreen}><ActivityIndicator color="#fff" size="large" /></View>;
  }

  return (
    <View style={S.root}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <SafeAreaView style={S.hero} edges={['top']}>
          <TouchableOpacity style={S.avatarWrap} onPress={handlePickAvatar} disabled={uploadingAvatar} activeOpacity={0.85}>
            {uploadingAvatar
              ? <ActivityIndicator color="#fff" />
              : avatarUri
                ? <Image source={{ uri: avatarUri }} style={S.avatarImg} />
                : <Text style={S.avatarInitial}>{user?.name?.charAt(0).toUpperCase()}</Text>
            }
            <View style={S.avatarEditBadge}>
              <MaterialCommunityIcons name="camera-outline" size={14} color="#0f172a" />
            </View>
          </TouchableOpacity>
          <Text style={S.heroName}>{user?.name}</Text>
          <Text style={S.heroEmail}>{user?.email}</Text>
          <TouchableOpacity style={S.genderToggle} onPress={handleGenderToggle} activeOpacity={0.8}>
            <MaterialCommunityIcons
              name={profile?.gender === 'female' ? 'gender-female' : 'gender-male'}
              size={14} color="#fff"
            />
            <Text style={S.genderToggleText}>
              {profile?.gender === 'female' ? 'Feminino' : 'Masculino'}
            </Text>
            <MaterialCommunityIcons name="swap-horizontal" size={12} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={S.content}>

          {/* ── COMPOSIÇÃO CORPORAL ── */}
          <Text style={S.sectionTitle}>Composição Corporal</Text>
          <View style={S.corpoGrid}>
            <View style={S.corpoCard}>
              <MaterialCommunityIcons name="scale-bathroom" size={18} color="#6366f1" />
              <Text style={S.corpoVal}>{profile?.currentWeight?.toFixed(1) ?? '—'}</Text>
              <Text style={S.corpoUnit}>kg</Text>
              <Text style={S.corpoLbl}>Peso</Text>
            </View>
            <View style={[S.corpoCard, S.corpoCardDark]}>
              <MaterialCommunityIcons name="human" size={18} color="#f97316" />
              <Text style={[S.corpoVal, { color: '#fff' }]}>{bodyFat !== null ? `${bodyFat}` : '—'}</Text>
              <Text style={[S.corpoUnit, { color: 'rgba(255,255,255,0.4)' }]}>%</Text>
              <Text style={[S.corpoLbl, { color: 'rgba(255,255,255,0.4)' }]}>Gordura</Text>
              {bfCat && (
                <View style={[S.catBadge, { backgroundColor: bfCat.color + '22', borderColor: bfCat.color + '55' }]}>
                  <Text style={[S.catText, { color: bfCat.color }]}>{bfCat.label}</Text>
                </View>
              )}
            </View>
            <View style={S.corpoCard}>
              <MaterialCommunityIcons name="calculator-variant-outline" size={18} color="#3b82f6" />
              <Text style={S.corpoVal}>{bmi?.toFixed(1) ?? '—'}</Text>
              <Text style={S.corpoUnit}>IMC</Text>
              <Text style={S.corpoLbl}>Índice</Text>
              {bmiCat && (
                <View style={[S.catBadge, { backgroundColor: bmiCat.color + '22', borderColor: bmiCat.color + '55' }]}>
                  <Text style={[S.catText, { color: bmiCat.color }]}>{bmiCat.label}</Text>
                </View>
              )}
            </View>
          </View>

          {(!profile?.height || !profile?.age) && (
            <View style={S.infoNote}>
              <MaterialCommunityIcons name="information-outline" size={14} color="#6366f1" />
              <Text style={S.infoNoteText}>Adicione altura e idade para calcular gordura e IMC automaticamente.</Text>
            </View>
          )}
          {bodyFat !== null && (
            <Text style={S.methodNote}>Estimativa pela fórmula de Deurenberg (IMC + idade + gênero).</Text>
          )}

          {/* ── MEDIDAS ── */}
          <Text style={S.sectionTitle}>Medidas</Text>
          <View style={S.metricsRow}>
            {[
              { icon: 'human-male-height', color: '#8b5cf6', lbl: 'Altura', val: profile?.height ? `${profile.height.toFixed(0)}cm` : '—' },
              { icon: 'cake-variant-outline', color: '#f97316', lbl: 'Idade', val: profile?.age ? `${profile.age}a` : '—' },
              { icon: 'target', color: '#22c55e', lbl: 'Alvo', val: profile?.targetWeightMin && profile?.targetWeightMax ? `${profile.targetWeightMin.toFixed(0)}–${profile.targetWeightMax.toFixed(0)}kg` : '—' },
            ].map(m => (
              <View key={m.lbl} style={S.metricCard}>
                <MaterialCommunityIcons name={m.icon as any} size={20} color={m.color} />
                <Text style={S.metricVal}>{m.val}</Text>
                <Text style={S.metricLbl}>{m.lbl}</Text>
              </View>
            ))}
          </View>

          {/* ── NUTRIÇÃO TREINO ── */}
          <Text style={S.sectionTitle}>Nutrição — Treino</Text>
          <View style={S.macroCard}>
            {[
              { lbl: 'Calorias', val: `${profile?.caloriesTrainingDay ?? '—'} kcal`, color: '#f97316', icon: 'fire' },
              { lbl: 'Proteína', val: `${profile?.proteinDaily?.toFixed(0) ?? '—'} g`, color: '#3b82f6', icon: 'arm-flex-outline' },
              { lbl: 'Carboidratos', val: `${profile?.carbsTrainingDay?.toFixed(0) ?? '—'} g`, color: '#8b5cf6', icon: 'bread-slice-outline' },
              { lbl: 'Gordura', val: `${profile?.fatTrainingDay?.toFixed(0) ?? '—'} g`, color: '#f59e0b', icon: 'water-circle' },
            ].map((r, i) => (
              <View key={r.lbl} style={[S.macroRow, i > 0 && S.macroRowBorder]}>
                <View style={S.macroLeft}>
                  <MaterialCommunityIcons name={r.icon as any} size={16} color={r.color} />
                  <Text style={S.macroLabel}>{r.lbl}</Text>
                </View>
                <Text style={[S.macroValText, { color: r.color }]}>{r.val}</Text>
              </View>
            ))}
          </View>

          {/* ── NUTRIÇÃO DESCANSO ── */}
          <Text style={S.sectionTitle}>Nutrição — Descanso</Text>
          <View style={S.macroCard}>
            {[
              { lbl: 'Calorias', val: `${profile?.caloriesRestDay ?? '—'} kcal`, color: '#6366f1', icon: 'fire' },
              { lbl: 'Carboidratos', val: `${profile?.carbsRestDay?.toFixed(0) ?? '—'} g`, color: '#8b5cf6', icon: 'bread-slice-outline' },
              { lbl: 'Gordura', val: `${profile?.fatRestDay?.toFixed(0) ?? '—'} g`, color: '#f59e0b', icon: 'water-circle' },
              { lbl: 'Água', val: `${profile?.waterGoal?.toFixed(1) ?? '—'} L`, color: '#06b6d4', icon: 'water-outline' },
            ].map((r, i) => (
              <View key={r.lbl} style={[S.macroRow, i > 0 && S.macroRowBorder]}>
                <View style={S.macroLeft}>
                  <MaterialCommunityIcons name={r.icon as any} size={16} color={r.color} />
                  <Text style={S.macroLabel}>{r.lbl}</Text>
                </View>
                <Text style={[S.macroValText, { color: r.color }]}>{r.val}</Text>
              </View>
            ))}
          </View>

          {/* ── EXCEL ── */}
          <Text style={S.sectionTitle}>Importar Planilha</Text>
          <View style={S.excelCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialCommunityIcons name="microsoft-excel" size={22} color="#16a34a" />
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#0f172a' }}>Plano de Treino / Dieta</Text>
            </View>
            <Text style={S.excelDesc}>Importe um Excel com treinos e refeições. O app registrará automaticamente.</Text>
            <View style={S.excelBtns}>
              <TouchableOpacity style={S.templateBtn} onPress={() => openURL(WorkoutPlanService.getTemplateUrl())}>
                <MaterialCommunityIcons name="download-outline" size={15} color="#0f172a" />
                <Text style={S.templateBtnText}>Baixar modelo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.importBtn, importingExcel && { opacity: 0.5 }]} onPress={handleImportExcel} disabled={importingExcel}>
                {importingExcel
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <><MaterialCommunityIcons name="upload-outline" size={15} color="#fff" /><Text style={S.importBtnText}>Importar .xlsx</Text></>
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* ── LOGOUT ── */}
          <TouchableOpacity style={S.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <MaterialCommunityIcons name="logout" size={18} color="#ef4444" />
            <Text style={S.logoutText}>Sair da conta</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },
  loadScreen: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  hero: { backgroundColor: '#111827', alignItems: 'center', paddingTop: 16, paddingBottom: 32, paddingHorizontal: 20 },
  avatarWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 12, overflow: 'hidden' },
  avatarImg: { width: 96, height: 96, borderRadius: 48 },
  avatarInitial: { fontSize: 38, fontWeight: '900', color: '#fff' },
  avatarEditBadge: { position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  heroName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2, marginBottom: 14 },
  genderToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  genderToggleText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  content: { backgroundColor: '#f1f5f9', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -8, paddingTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 12, paddingHorizontal: 4 },
  corpoGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  corpoCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, paddingVertical: 18, alignItems: 'center', gap: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  corpoCardDark: { backgroundColor: '#111827' },
  corpoVal: { fontSize: 24, fontWeight: '900', color: '#0f172a', letterSpacing: -1, marginTop: 4 },
  corpoUnit: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  corpoLbl: { fontSize: 9, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  catBadge: { marginTop: 6, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  catText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  infoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#eef2ff', borderRadius: 12, padding: 12, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: '#6366f1' },
  infoNoteText: { flex: 1, fontSize: 12, color: '#4338ca', lineHeight: 17 },
  methodNote: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginBottom: 20, paddingHorizontal: 4 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  metricVal: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginTop: 4 },
  metricLbl: { fontSize: 9, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  macroCard: { backgroundColor: '#fff', borderRadius: 20, padding: 4, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  macroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  macroRowBorder: { borderTopWidth: 1, borderTopColor: '#f8fafc' },
  macroLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  macroLabel: { fontSize: 14, fontWeight: '600', color: '#334155' },
  macroValText: { fontSize: 15, fontWeight: '800' },
  excelCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, gap: 12 },
  excelDesc: { fontSize: 13, color: '#64748b', lineHeight: 19 },
  excelBtns: { flexDirection: 'row', gap: 10 },
  templateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#0f172a', borderRadius: 12, paddingVertical: 10 },
  templateBtnText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  importBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0f172a', borderRadius: 12, paddingVertical: 10 },
  importBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#fee2e2', backgroundColor: '#fff5f5', borderRadius: 16, paddingVertical: 16, marginBottom: 8 },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
});
