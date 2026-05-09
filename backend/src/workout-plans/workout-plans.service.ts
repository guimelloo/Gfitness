import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

const DAY_NAME_MAP: Record<string, number> = {
  domingo: 0, sunday: 0, dom: 0,
  segunda: 1, monday: 1, seg: 1,
  terça: 2, tuesday: 2, ter: 2, 'terca': 2,
  quarta: 3, wednesday: 3, qua: 3,
  quinta: 4, thursday: 4, qui: 4,
  sexta: 5, friday: 5, sex: 5,
  sábado: 6, saturday: 6, sab: 6, 'sabado': 6,
};

function parseDayOfWeek(value: any): number {
  if (typeof value === 'number') return Math.round(value) % 7;
  const str = String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!isNaN(Number(str))) return Number(str) % 7;
  return DAY_NAME_MAP[str] ?? -1;
}

@Injectable()
export class WorkoutPlansService {
  constructor(private prisma: PrismaService) {}

  async getByUser(userId: string) {
    return this.prisma.workoutPlan.findUnique({
      where: { userId },
      include: {
        days: {
          include: { exercises: { orderBy: { order: 'asc' } } },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });
  }

  async upsertPlan(userId: string, days: { dayOfWeek: number; dayName: string; muscleGroups: string; exercises: { name: string; sets: number; reps: string; note?: string; order?: number }[] }[]) {
    const existing = await this.prisma.workoutPlan.findUnique({ where: { userId } });

    if (existing) {
      // delete all existing days (cascade removes exercises)
      await this.prisma.workoutPlanDay.deleteMany({ where: { workoutPlanId: existing.id } });

      await this.prisma.workoutPlan.update({
        where: { userId },
        data: {
          days: {
            create: days.map(d => ({
              dayOfWeek: d.dayOfWeek,
              dayName: d.dayName,
              muscleGroups: d.muscleGroups,
              exercises: { create: d.exercises.map((e, i) => ({ ...e, order: e.order ?? i })) },
            })),
          },
        },
      });
    } else {
      await this.prisma.workoutPlan.create({
        data: {
          userId,
          days: {
            create: days.map(d => ({
              dayOfWeek: d.dayOfWeek,
              dayName: d.dayName,
              muscleGroups: d.muscleGroups,
              exercises: { create: d.exercises.map((e, i) => ({ ...e, order: e.order ?? i })) },
            })),
          },
        },
      });
    }

    return this.getByUser(userId);
  }

  async updateDay(userId: string, dayId: string, data: { dayName?: string; muscleGroups?: string; exercises?: { name: string; sets: number; reps: string; note?: string }[] }) {
    const plan = await this.prisma.workoutPlan.findUnique({ where: { userId } });
    if (!plan) throw new NotFoundException('Workout plan not found');

    const updateData: any = {};
    if (data.dayName) updateData.dayName = data.dayName;
    if (data.muscleGroups) updateData.muscleGroups = data.muscleGroups;

    if (data.exercises) {
      await this.prisma.workoutPlanExercise.deleteMany({ where: { workoutPlanDayId: dayId } });
      updateData.exercises = {
        create: data.exercises.map((e, i) => ({ ...e, order: i })),
      };
    }

    return this.prisma.workoutPlanDay.update({ where: { id: dayId }, data: updateData, include: { exercises: { orderBy: { order: 'asc' } } } });
  }

  async deleteDay(userId: string, dayId: string) {
    const plan = await this.prisma.workoutPlan.findUnique({ where: { userId } });
    if (!plan) throw new NotFoundException('Workout plan not found');
    return this.prisma.workoutPlanDay.delete({ where: { id: dayId } });
  }

  async importFromExcel(userId: string, buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // --- Workout Plan import from first sheet ---
    const workoutSheetName = workbook.SheetNames.find(n => /treino/i.test(n)) ?? workbook.SheetNames[0];
    const workoutSheet = workbook.Sheets[workoutSheetName];
    const rows = XLSX.utils.sheet_to_json<any>(workoutSheet, { header: 1, defval: '' });

    // Build days map: dayOfWeek -> day data
    const daysMap = new Map<number, { dayName: string; muscleGroups: string; exercises: any[] }>();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[0]) continue;

      const dayOfWeek = parseDayOfWeek(row[0]);
      if (dayOfWeek < 0) continue;

      const dayName = String(row[1] || '').trim() || `Dia ${dayOfWeek}`;
      const muscleGroups = String(row[2] || '').trim() || '';
      const exerciseName = String(row[3] || '').trim();
      const sets = parseInt(row[4]) || 3;
      const reps = String(row[5] || '10').trim();
      const note = String(row[6] || '').trim() || undefined;

      if (!exerciseName) continue;

      if (!daysMap.has(dayOfWeek)) {
        daysMap.set(dayOfWeek, { dayName, muscleGroups, exercises: [] });
      }
      daysMap.get(dayOfWeek)!.exercises.push({ name: exerciseName, sets, reps, note });
    }

    const days = Array.from(daysMap.entries()).map(([dayOfWeek, d]) => ({ dayOfWeek, ...d }));

    const workoutResult = days.length > 0 ? await this.upsertPlan(userId, days) : null;

    // --- Diet/Meal import from second sheet (optional) ---
    let mealsImported = 0;
    const dietSheetName = workbook.SheetNames.find(n => /dieta|meal|refeic/i.test(n));
    if (dietSheetName) {
      const dietSheet = workbook.Sheets[dietSheetName];
      const dietRows = XLSX.utils.sheet_to_json<any>(dietSheet, { header: 1, defval: '' });

      const mealGroups = new Map<string, { totalKcal: number; protein: number; carbs: number; fat: number }>();

      for (let i = 1; i < dietRows.length; i++) {
        const row = dietRows[i];
        if (!row || !row[0]) continue;

        const mealName = String(row[0] || '').trim();
        const calories = parseFloat(row[4]) || 0;
        const protein = parseFloat(row[5]) || 0;
        const carbs = parseFloat(row[6]) || 0;
        const fat = parseFloat(row[7]) || 0;

        if (!mealName) continue;

        if (!mealGroups.has(mealName)) {
          mealGroups.set(mealName, { totalKcal: 0, protein: 0, carbs: 0, fat: 0 });
        }
        const m = mealGroups.get(mealName)!;
        m.totalKcal += calories;
        m.protein += protein;
        m.carbs += carbs;
        m.fat += fat;
      }

      for (const [mealName, macros] of mealGroups) {
        await this.prisma.meal.create({
          data: {
            userId,
            name: mealName,
            totalKcal: Math.round(macros.totalKcal),
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat,
            mealTime: mealName.toLowerCase(),
            date: new Date(),
          },
        });
        mealsImported++;
      }
    }

    return {
      message: 'Importação concluída',
      workoutDaysImported: days.length,
      mealsImported,
      workoutPlan: workoutResult,
    };
  }

  async generateTemplate(): Promise<Buffer> {
    const wb = XLSX.utils.book_new();

    // Workout sheet
    const workoutData = [
      ['Dia (0=Dom,1=Seg,2=Ter,3=Qua,4=Qui,5=Sex,6=Sáb)', 'Nome do Dia', 'Grupos Musculares', 'Exercício', 'Séries', 'Repetições', 'Observação'],
      [1, 'Segunda - Costas', 'Costas, Bíceps', 'Barra fixa', 4, '6-8', 'Peito aberto'],
      [1, 'Segunda - Costas', 'Costas, Bíceps', 'Remada curvada', 4, '6-8', 'Sem roubar'],
      [3, 'Quarta - Peito', 'Peito, Tríceps', 'Supino reto', 4, '6-8', ''],
      [5, 'Sexta - Perna', 'Perna, Core', 'Agachamento', 4, '6-8', ''],
      [0, 'Domingo - Full Body', 'Full Body', 'Levantamento terra', 3, '5', 'Leve'],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(workoutData);
    ws1['!cols'] = [{ wch: 12 }, { wch: 22 }, { wch: 22 }, { wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Treinos');

    // Diet sheet
    const dietData = [
      ['Refeição', 'Alimento', 'Quantidade', 'Unidade', 'Calorias', 'Proteína (g)', 'Carboidratos (g)', 'Gordura (g)'],
      ['Café da manhã', 'Ovos mexidos', 3, 'unidade', 210, 18, 0, 15],
      ['Café da manhã', 'Pão integral', 2, 'fatia', 140, 6, 28, 2],
      ['Almoço', 'Frango grelhado', 200, 'g', 330, 62, 0, 8],
      ['Almoço', 'Arroz integral', 150, 'g', 210, 4, 44, 2],
      ['Jantar', 'Peixe assado', 200, 'g', 280, 52, 0, 8],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(dietData);
    ws2['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Dieta');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}
