import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGuilhermeProfile() {
  try {
    console.log('🌱 Starting seed for Guilherme profile...');

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: 'negromonteguilherme@gmail.com' },
    });

    if (!user) {
      console.error('❌ User not found with email: negromonteguilherme@gmail.com');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.id})`);

    // 2. Create or update UserProfile
    const userProfile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        currentWeight: 86,
        targetWeightMin: 80,
        targetWeightMax: 83,
        height: 182,
        age: 20,
        caloriesTrainingDay: 2300,
        caloriesRestDay: 2100,
        proteinDaily: 180,
        carbsTrainingDay: 245,
        carbsRestDay: 195,
        fatTrainingDay: 66,
        fatRestDay: 70,
        waterGoal: 3.0,
        WeekBlockNumber: 1,
      },
      update: {
        currentWeight: 86,
        targetWeightMin: 80,
        targetWeightMax: 83,
        height: 182,
        age: 20,
        caloriesTrainingDay: 2300,
        caloriesRestDay: 2100,
        proteinDaily: 180,
        carbsTrainingDay: 245,
        carbsRestDay: 195,
        fatTrainingDay: 66,
        fatRestDay: 70,
        waterGoal: 3.0,
        WeekBlockNumber: 1,
      },
    });

    console.log('✅ UserProfile updated');

    // 3. Create Exercises
    const exercises = [
      { name: 'Barra fixa assistida / livre', muscleGroup: 'costas', sets: 4, reps: '6-8' },
      { name: 'Remada curvada com barra', muscleGroup: 'costas', sets: 4, reps: '6-8' },
      { name: 'Remada unilateral com halter', muscleGroup: 'costas', sets: 3, reps: '8-10' },
      { name: 'Crucifixo invertido com halter', muscleGroup: 'posterior', sets: 3, reps: '12-15' },
      { name: 'Face pull', muscleGroup: 'posterior', sets: 3, reps: '12-15' },
      { name: 'Rosca direta com barra', muscleGroup: 'biceps', sets: 3, reps: '8-10' },
      { name: 'Rosca alternada com halter', muscleGroup: 'biceps', sets: 2, reps: '10-12' },
      { name: 'Supino reto com barra', muscleGroup: 'peito', sets: 4, reps: '6-8' },
      { name: 'Supino inclinado com halter', muscleGroup: 'peito', sets: 3, reps: '8-10' },
      { name: 'Paralelas assistidas / mergulho', muscleGroup: 'peito', sets: 3, reps: '8-10' },
      { name: 'Flexão de braço', muscleGroup: 'peito', sets: 2, reps: 'até técnica boa' },
      { name: 'Tríceps testa com barra W', muscleGroup: 'triceps', sets: 3, reps: '10-12' },
      { name: 'Tríceps coice / corda', muscleGroup: 'triceps', sets: 2, reps: '12-15' },
      { name: 'Agachamento livre', muscleGroup: 'perna', sets: 4, reps: '6-8' },
      { name: 'Levantamento terra romeno', muscleGroup: 'perna', sets: 4, reps: '8-10' },
      { name: 'Afundo com halter', muscleGroup: 'perna', sets: 3, reps: '10-12' },
      { name: 'Agachamento goblet', muscleGroup: 'perna', sets: 3, reps: '10-12' },
      { name: 'Panturrilha em pé', muscleGroup: 'perna', sets: 4, reps: '12-15' },
      { name: 'Prancha', muscleGroup: 'core', sets: 3, reps: '30-45s' },
      { name: 'Levantamento terra técnico', muscleGroup: 'fullbody', sets: 3, reps: '5' },
      { name: 'Desenvolvimento com halter', muscleGroup: 'ombro', sets: 2, reps: '8-10' },
      { name: 'Farmer walk', muscleGroup: 'core', sets: 2, reps: '30-40m' },
    ];

    let exercisesCreated = 0;
    for (const ex of exercises) {
      try {
        await prisma.exercise.create({
          data: {
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            equipment: 'barbell/dumbbell',
          },
        });
        exercisesCreated++;
      } catch (err: any) {
        if (err.code !== 'P2002') {
          // Ignore unique constraint errors
          throw err;
        }
      }
    }

    console.log(`✅ Created ${exercisesCreated}/${exercises.length} exercises`);

    // 4. Create Meals (Banco de refeições)
    const meals = [
      // Café da manhã
      { name: 'R1A - Ovos + pão + fruta', totalKcal: 390, protein: 22, carbs: 38, fat: 15, category: 'breakfast' },
      { name: 'R1B - Iogurte + aveia + fruta', totalKcal: 330, protein: 24, carbs: 38, fat: 6, category: 'breakfast' },
      { name: 'R1C - Vitamina + pão com queijo', totalKcal: 420, protein: 20, carbs: 46, fat: 14, category: 'breakfast' },
      { name: 'R1D - Omelete + pão', totalKcal: 410, protein: 25, carbs: 28, fat: 20, category: 'breakfast' },
      // Almoço
      { name: 'R2A - Arroz + frango + salada', totalKcal: 550, protein: 50, carbs: 55, fat: 12, category: 'lunch' },
      { name: 'R2B - Arroz + carne moída + verdura', totalKcal: 600, protein: 45, carbs: 55, fat: 18, category: 'lunch' },
      { name: 'R2C - Arroz + peixe + legumes', totalKcal: 540, protein: 46, carbs: 50, fat: 12, category: 'lunch' },
      { name: 'R2D - Macarrão + frango', totalKcal: 560, protein: 42, carbs: 60, fat: 10, category: 'lunch' },
      // Pré-treino
      { name: 'R3A - Banana + aveia', totalKcal: 190, protein: 4, carbs: 35, fat: 2, category: 'preworkout' },
      { name: 'R3B - Pão + queijo', totalKcal: 260, protein: 13, carbs: 24, fat: 11, category: 'preworkout' },
      { name: 'R3C - Iogurte + fruta', totalKcal: 210, protein: 15, carbs: 24, fat: 4, category: 'preworkout' },
      { name: 'R3D - Tapioca + frango', totalKcal: 290, protein: 20, carbs: 36, fat: 4, category: 'preworkout' },
      // Pós-treino
      { name: 'R4A - Arroz + frango', totalKcal: 430, protein: 38, carbs: 45, fat: 8, category: 'postworkout' },
      { name: 'R4B - Iogurte proteico + fruta', totalKcal: 220, protein: 17, carbs: 26, fat: 3, category: 'postworkout' },
      { name: 'R4C - Whey + banana', totalKcal: 230, protein: 24, carbs: 24, fat: 2, category: 'postworkout' },
      { name: 'R4D - Sanduíche de frango', totalKcal: 390, protein: 30, carbs: 35, fat: 10, category: 'postworkout' },
      // Jantar
      { name: 'R5A - Arroz + frango + salada', totalKcal: 500, protein: 42, carbs: 45, fat: 10, category: 'dinner' },
      { name: 'R5B - Peixe + arroz + legumes', totalKcal: 490, protein: 40, carbs: 42, fat: 9, category: 'dinner' },
      { name: 'R5C - Macarrão + frango', totalKcal: 540, protein: 38, carbs: 60, fat: 10, category: 'dinner' },
      { name: 'R5D - Omelete + arroz', totalKcal: 430, protein: 25, carbs: 35, fat: 20, category: 'dinner' },
      // Ceia
      { name: 'R7A - Iogurte + aveia', totalKcal: 220, protein: 28, carbs: 20, fat: 4, category: 'snack' },
      { name: 'R7B - 3 ovos inteiros', totalKcal: 210, protein: 18, carbs: 2, fat: 15, category: 'snack' },
      { name: 'R7C - Whey + aveia', totalKcal: 200, protein: 27, carbs: 18, fat: 3, category: 'snack' },
    ];

    let mealsCreated = 0;
    for (const meal of meals) {
      try {
        await prisma.meal.create({
          data: {
            name: meal.name,
            totalKcal: meal.totalKcal,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            mealTime: meal.category,
            date: new Date(),
            userId: user.id,
          },
        });
        mealsCreated++;
      } catch (err: any) {
        if (err.code !== 'P2002') {
          // Ignore unique constraint errors
          throw err;
        }
      }
    }

    console.log(`✅ Created ${mealsCreated}/${meals.length} meal options`);

    // 5. Create WeeklyProgress records (12 semanas)
    let weeklyProgressCreated = 0;
    for (let week = 1; week <= 12; week++) {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (week - 1) * 7);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        // Check if already exists
        const existing = await prisma.weeklyProgress.findFirst({
          where: {
            userId: user.id,
            weekStart: startDate,
          },
        });

        if (!existing) {
          await prisma.weeklyProgress.create({
            data: {
              userId: user.id,
              weekStart: startDate,
              weekEnd: endDate,
              notes: `Semana ${week} - Bloco de 12 semanas`,
            },
          });
          weeklyProgressCreated++;
        }
      } catch (err: any) {
        // Continue on error
        console.warn(`Week ${week} error:`, err.message);
      }
    }

    console.log(`✅ Created ${weeklyProgressCreated} WeeklyProgress records`);

    // 6. Create Alerts (Checklist semanal)
    const alerts = [
      { title: 'Bater proteína', message: 'Meta: 180g de proteína', isActive: true },
      { title: 'Beber 3L de água', message: 'Meta diária: 3 litros', isActive: true },
      { title: 'Treinar 3x + BJJ', message: 'Manter frequência semanal', isActive: true },
      { title: 'Evitar fast food no improviso', message: 'Levar refeição preparada', isActive: true },
      { title: 'Registrar peso 1x/sem', message: 'Usar balança no mesmo dia/hora', isActive: true },
      { title: 'Dormir 7–8h', message: 'Meta de sono: 7-8 horas', isActive: true },
      { title: 'Levar lanche pronto', message: 'Preparar lanches no domingo', isActive: true },
      { title: 'Avaliar cintura semanal', message: 'Medir cintura toda segunda', isActive: true },
    ];

    let alertsCreated = 0;
    for (const alert of alerts) {
      try {
        await prisma.alert.create({
          data: {
            ...alert,
            userId: user.id,
          },
        });
        alertsCreated++;
      } catch (err: any) {
        // Continue on error
        console.warn(`Alert "${alert.title}" error:`, err.message);
      }
    }

    console.log(`✅ Created ${alertsCreated}/${alerts.length} alerts (checklist semanal)`);

    // 7. Create Coach Notes
    const coachNotes = [
      {
        content: `Plano Guilherme - Recomposição corporal em 12 semanas\n\nFoco: Reduzir gordura mantendo força e ganhando massa magra\nAtualmente: 86kg | Objetivo: 80-83kg\nTempo de treino: 1 mês | Frequência: 3-4 dias/sem + BJJ\n\nPrioridades:\n1. Aprender a treinar com QUALIDADE (postura, execução, padrão de movimento)\n2. Bater metas nutricionais (2300 cal treino, 2100 descanso)\n3. Consistência alimentar (evitar improviso)\n4. Dormir 7-8h\n5. Beber 3L água/dia`,
      },
      {
        content: `Estrutura nutricional:\n\nDIA DE TREINO: 2300 kcal | Prot 180g | Carb 245g | Gord 66g\nDIA DESCANSO: 2100 kcal | Prot 180g | Carb 195g | Gord 70g\n\nOpções de café: R1D (omelete + pão) padrão\nAlmoço: R2A (arroz + frango + salada) ou R2C (peixe)\nPré-treino: R3C (iogurte + fruta) - leve\nPós-treino: R4A (arroz + frango) - foco proteína+carbo\nJantar: R5A ou R5B (peixe preferido)\n\nMeta: 3 refeições base + 1-2 lanches proteicos`,
      },
      {
        content: `TREINO - Foco em base técnica\n\nSEMANA 1-4: Aprender padrões\n- Costas/bíceps/posterior (segunda)\n- Peito/tríceps (quarta)\n- Perna completa (sexta)\n- BJJ (quinta)\n- Full body leve (domingo opcional)\n\nPrioritário: Execução perfeita > carga pesada\nRIR: 1-2 (deixar 1-2 reps na câmara)\nFoco em: Postura, escápula, padrão de agachar`,
      },
    ];

    let coachNotesCreated = 0;
    for (const note of coachNotes) {
      try {
        await prisma.coachNote.create({
          data: {
            ...note,
            userId: user.id,
          },
        });
        coachNotesCreated++;
      } catch (err: any) {
        console.warn(`Coach note error:`, err.message);
      }
    }

    console.log(`✅ Created ${coachNotesCreated}/${coachNotes.length} coach notes`);

    // 8. Create today's DailyLog with meals
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyLog = await prisma.dailyLog.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!dailyLog) {
      dailyLog = await prisma.dailyLog.create({
        data: {
          userId: user.id,
          date: today,
          weight: 85.5,
          waterIntake: 2.5,
          workoutCompleted: false,
        },
      });
    }

    // Add sample meals for today
    const mealsForToday = [
      {
        mealName: 'Café da manhã',
        totalKcal: 450,
        protein: 20,
        carbs: 60,
        fat: 12,
        items: [
          { foodName: 'Omelete (3 ovos)', quantity: 3, unit: 'unidades', calories: 210, protein: 18, carbs: 2, fat: 15 },
          { foodName: 'Pão integral', quantity: 50, unit: 'g', calories: 140, protein: 4, carbs: 25, fat: 2 },
          { foodName: 'Banana', quantity: 100, unit: 'g', calories: 100, protein: 1, carbs: 27, fat: 0 },
        ],
      },
      {
        mealName: 'Almoço',
        totalKcal: 850,
        protein: 55,
        carbs: 95,
        fat: 18,
        items: [
          { foodName: 'Arroz branco', quantity: 150, unit: 'g', calories: 195, protein: 4, carbs: 43, fat: 0.5 },
          { foodName: 'Frango grelhado', quantity: 200, unit: 'g', calories: 320, protein: 53, carbs: 0, fat: 12 },
          { foodName: 'Salada verde (alface + tomate)', quantity: 200, unit: 'g', calories: 30, protein: 2, carbs: 4, fat: 0 },
          { foodName: 'Azeite de oliva', quantity: 10, unit: 'ml', calories: 90, protein: 0, carbs: 0, fat: 10 },
          { foodName: 'Feijão carioca', quantity: 100, unit: 'g', calories: 115, protein: 8, carbs: 20, fat: 0 },
        ],
      },
      {
        mealName: 'Pós-treino',
        totalKcal: 400,
        protein: 35,
        carbs: 50,
        fat: 5,
        items: [
          { foodName: 'Iogurte grego', quantity: 200, unit: 'g', calories: 150, protein: 20, carbs: 8, fat: 5 },
          { foodName: 'Banana', quantity: 120, unit: 'g', calories: 120, protein: 1, carbs: 27, fat: 0 },
          { foodName: 'Granola', quantity: 40, unit: 'g', calories: 180, protein: 4, carbs: 20, fat: 9 },
          { foodName: 'Mel', quantity: 10, unit: 'ml', calories: 32, protein: 0, carbs: 8, fat: 0 },
        ],
      },
    ];

    let mealsAddedToday = 0;
    for (const meal of mealsForToday) {
      try {
        const existingMeal = await prisma.mealLog.findFirst({
          where: {
            dailyLogId: dailyLog.id,
            mealName: meal.mealName,
          },
        });

        if (!existingMeal) {
          const createdMeal = await prisma.mealLog.create({
            data: {
              dailyLogId: dailyLog.id,
              mealName: meal.mealName,
              totalKcal: meal.totalKcal,
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat,
              items: {
                create: meal.items,
              },
            },
          });
          mealsAddedToday++;
        }
      } catch (err: any) {
        console.warn(`Meal "${meal.mealName}" error:`, err.message);
      }
    }

    console.log(`✅ Created ${mealsAddedToday} sample meals for today`);

    console.log('\n🎉 Seed completado com sucesso!');
    console.log(`\nResumo para ${user.name}:`);
    console.log(`- UserProfile atualizado`);
    console.log(`- ${exercisesCreated} exercícios criados`);
    console.log(`- ${mealsCreated} opções de refeição criadas`);
    console.log(`- ${weeklyProgressCreated} semanas de WeeklyProgress criadas`);
    console.log(`- ${alertsCreated} alertas (checklist) criados`);
    console.log(`- ${coachNotesCreated} notas do técnico criadas`);
    console.log(`- ${mealsAddedToday} refeições adicionadas ao log de hoje`);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedGuilhermeProfile();
