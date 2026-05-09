import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

// Legacy API (documentDirectory, EncodingType, writeAsStringAsync) — not available on web
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface ExportData {
  date: string;
  weight?: number;
  workoutCompleted?: boolean;
  workoutType?: string;
  waterIntake?: number;
  waterGoal?: number;
  notes?: string;
  mealCount?: number;
}

export class ExportService {
  static async exportToExcel(data: ExportData[], fileName: string = 'dias-check.xlsx') {
    const formattedData = data.map((day) => ({
      Data: day.date,
      Peso: day.weight ? day.weight.toFixed(2) + ' kg' : '—',
      Treino: day.workoutCompleted ? '✓ Completo' : '✗ Não fez',
      'Tipo Treino': day.workoutType || '—',
      'Água (L)': day.waterIntake ? day.waterIntake.toFixed(1) : '—',
      'Meta Água (L)': day.waterGoal || 3.0,
      Refeições: day.mealCount || 0,
      Observações: day.notes || '—',
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 13 }, { wch: 12 }, { wch: 25 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dias Check');

    if (Platform.OS === 'web') {
      const wbout: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      return { success: true, message: 'Arquivo baixado com sucesso!' };
    }

    const wbout: string = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    const path = (FileSystemLegacy.documentDirectory ?? '') + fileName;
    await FileSystemLegacy.writeAsStringAsync(path, wbout, {
      encoding: FileSystemLegacy.EncodingType.Base64,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error('Compartilhamento não disponível neste dispositivo');
    }

    await Sharing.shareAsync(path, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Compartilhar arquivo Excel',
      UTI: 'com.microsoft.excel.xlsx',
    });

    return { success: true, message: 'Arquivo exportado com sucesso!' };
  }
}
