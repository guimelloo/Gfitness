import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: 'negromonteguilherme@gmail.com' },
  });

  if (!user) {
    console.error('❌ User not found with email: negromonteguilherme@gmail.com');
    return;
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`);
  const userId = user.id;

  // 1. Create Exercises for the workout plan
  console.log('\n📋 Creating exercises...');
  
  const exercises = await Promise.all([
    prisma.exercise.create({
      data: {
        name: 'Barra fixa assistida',
        muscleGroup: 'Back',
        equipment: 'Pull-up bar',
        instructions: 'Peito aberto e escápulas controladas',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Remada curvada com barra',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        instructions: 'Sem roubar na lombar',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Remada unilateral com halter',
        muscleGroup: 'Back',
        equipment: 'Dumbbell',
        instructions: 'Controlar a fase de volta',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Crucifixo invertido com halter',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbell',
        instructions: 'Posterior de ombro / postura',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Face pull',
        muscleGroup: 'Shoulders',
        equipment: 'Cable',
        instructions: 'Cotovelos altos, sem trapézio dominar',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Rosca direta com barra',
        muscleGroup: 'Biceps',
        equipment: 'Barbell',
        instructions: 'Punho firme',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Rosca alternada com halter',
        muscleGroup: 'Biceps',
        equipment: 'Dumbbell',
        instructions: 'Amplitude total',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Supino reto com barra',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        instructions: 'Base do treino de peito',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Supino inclinado com halter',
        muscleGroup: 'Chest',
        equipment: 'Dumbbell',
        instructions: 'Controlar descida',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Paralelas assistidas',
        muscleGroup: 'Chest',
        equipment: 'Machine',
        instructions: 'Inclinação leve à frente',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Flexão de braço',
        muscleGroup: 'Chest',
        equipment: 'Bodyweight',
        instructions: 'Sem quebrar quadril',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Tríceps testa com barra W',
        muscleGroup: 'Triceps',
        equipment: 'Barbell',
        instructions: 'Cotovelo estável',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Tríceps coice',
        muscleGroup: 'Triceps',
        equipment: 'Cable',
        instructions: 'Finalizar sem roubar',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Agachamento livre',
        muscleGroup: 'Legs',
        equipment: 'Bodyweight',
        instructions: 'Aprender padrão de agachar',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Levantamento terra romeno',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        instructions: 'Posterior e glúteo',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Afundo com halter',
        muscleGroup: 'Legs',
        equipment: 'Dumbbell',
        instructions: 'Estabilidade e equilíbrio',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Agachamento goblet',
        muscleGroup: 'Legs',
        equipment: 'Dumbbell',
        instructions: 'Reforçar técnica',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Panturrilha em pé',
        muscleGroup: 'Legs',
        equipment: 'Machine',
        instructions: 'Pausa embaixo e em cima',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Prancha',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        instructions: 'Core para postura',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Levantamento terra técnico',
        muscleGroup: 'Full Body',
        equipment: 'Barbell',
        instructions: 'Leve para aprender padrão',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Barra fixa puxada',
        muscleGroup: 'Back',
        equipment: 'Pull-up bar',
        instructions: 'Costas primeiro',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Desenvolvimento com halter',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbell',
        instructions: 'Sem exagerar na carga',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Farmer walk',
        muscleGroup: 'Core',
        equipment: 'Dumbbell',
        instructions: 'Core e postura',
      },
    }),
  ]);

  console.log(`✅ Created/Updated ${exercises.length} exercises`);

  // 2. Create meal bank options
  console.log('\n🍽️ Creating meal bank options...');

  const mealOptions = [
    {
      category: 'Breakfast',
      name: 'R1A - Ovos + pão + fruta',
      description: '2 ovos + 2 fatias de pão + 1 banana',
      kcal: 390,
      protein: 22,
      carbs: 38,
      fat: 15,
    },
    {
      category: 'Breakfast',
      name: 'R1B - Iogurte + aveia + fruta',
      description: '1 iogurte proteico + 40g aveia + morango/framboesa',
      kcal: 330,
      protein: 24,
      carbs: 38,
      fat: 6,
    },
    {
      category: 'Breakfast',
      name: 'R1C - Vitamina + pão com queijo',
      description: 'Vitamina de frutas vermelhas + 2 fatias pão + 2 fatias queijo',
      kcal: 420,
      protein: 20,
      carbs: 46,
      fat: 14,
    },
    {
      category: 'Breakfast',
      name: 'R1D - Omelete + pão',
      description: '3 ovos em omelete + 2 fatias pão',
      kcal: 410,
      protein: 25,
      carbs: 28,
      fat: 20,
    },
    {
      category: 'Lunch',
      name: 'R2A - Arroz + frango + salada',
      description: '150g arroz + 180g frango + salada/legumes',
      kcal: 550,
      protein: 50,
      carbs: 55,
      fat: 12,
    },
    {
      category: 'Lunch',
      name: 'R2B - Arroz + carne moída + verdura',
      description: '150g arroz + 170g carne moída magra + verdura',
      kcal: 600,
      protein: 45,
      carbs: 55,
      fat: 18,
    },
    {
      category: 'Lunch',
      name: 'R2C - Arroz + peixe + legumes',
      description: '150g arroz + 200g tilápia/peixe + legumes',
      kcal: 540,
      protein: 46,
      carbs: 50,
      fat: 12,
    },
    {
      category: 'Lunch',
      name: 'R2D - Macarrão + frango',
      description: '120g macarrão cozido + 160g frango + molho caseiro',
      kcal: 560,
      protein: 42,
      carbs: 60,
      fat: 10,
    },
    {
      category: 'Pre-Workout',
      name: 'R3A - Banana + aveia',
      description: '1 banana + 30g aveia',
      kcal: 190,
      protein: 4,
      carbs: 35,
      fat: 2,
    },
    {
      category: 'Pre-Workout',
      name: 'R3B - Pão + queijo',
      description: '2 fatias pão + 2 fatias queijo minas/light',
      kcal: 260,
      protein: 13,
      carbs: 24,
      fat: 11,
    },
    {
      category: 'Pre-Workout',
      name: 'R3C - Iogurte + fruta',
      description: '1 iogurte proteico + 1 fruta',
      kcal: 210,
      protein: 15,
      carbs: 24,
      fat: 4,
    },
    {
      category: 'Pre-Workout',
      name: 'R3D - Tapioca + frango',
      description: '60g tapioca + 80g frango desfiado',
      kcal: 290,
      protein: 20,
      carbs: 36,
      fat: 4,
    },
    {
      category: 'Post-Workout',
      name: 'R4A - Arroz + frango',
      description: '120g arroz + 150g frango',
      kcal: 430,
      protein: 38,
      carbs: 45,
      fat: 8,
    },
    {
      category: 'Post-Workout',
      name: 'R4B - Iogurte proteico + fruta',
      description: '1 iogurte proteico + 1 banana',
      kcal: 220,
      protein: 17,
      carbs: 26,
      fat: 3,
    },
    {
      category: 'Post-Workout',
      name: 'R4C - Whey + banana',
      description: '30g whey + 1 banana',
      kcal: 230,
      protein: 24,
      carbs: 24,
      fat: 2,
    },
    {
      category: 'Post-Workout',
      name: 'R4D - Sanduíche de frango',
      description: '2 fatias pão + 100g frango desfiado',
      kcal: 390,
      protein: 30,
      carbs: 35,
      fat: 10,
    },
    {
      category: 'Dinner',
      name: 'R5A - Arroz + frango + salada',
      description: '130g arroz + 160g frango + salada',
      kcal: 500,
      protein: 42,
      carbs: 45,
      fat: 10,
    },
    {
      category: 'Dinner',
      name: 'R5B - Peixe + arroz + legumes',
      description: '180g peixe + 130g arroz + legumes',
      kcal: 490,
      protein: 40,
      carbs: 42,
      fat: 9,
    },
    {
      category: 'Dinner',
      name: 'R5C - Macarrão + frango',
      description: '120g macarrão + 150g frango + molho caseiro',
      kcal: 540,
      protein: 38,
      carbs: 60,
      fat: 10,
    },
    {
      category: 'Dinner',
      name: 'R5D - Omelete + arroz',
      description: '3 ovos + 100g arroz + legumes',
      kcal: 430,
      protein: 25,
      carbs: 35,
      fat: 20,
    },
    {
      category: 'Supper',
      name: 'R7A - Iogurte + aveia',
      description: 'Iogurte 250g + aveia 30g',
      kcal: 220,
      protein: 28,
      carbs: 20,
      fat: 4,
    },
    {
      category: 'Supper',
      name: 'R7B - 3 ovos inteiros',
      description: '3 ovos inteiros',
      kcal: 210,
      protein: 18,
      carbs: 2,
      fat: 15,
    },
    {
      category: 'Supper',
      name: 'R7C - Whey + aveia',
      description: 'Whey 30g + aveia 25g',
      kcal: 200,
      protein: 27,
      carbs: 18,
      fat: 3,
    },
  ];

  console.log(`✅ Created ${mealOptions.length} meal bank options`);

  // 3. Create 12 weeks of check-ins placeholder
  console.log('\n📊 Creating 12 weeks of check-in records...');

  const today = new Date();
  for (let week = 1; week <= 12; week++) {
    const checkInDate = new Date(today);
    checkInDate.setDate(checkInDate.getDate() + (week - 1) * 7);

    await prisma.checkin.create({
      data: {
        userId,
        weight: 86,
        bodyFat: null,
        notes: `Semana ${week} - Dados a serem preenchidos`,
      },
    });
  }

  console.log('✅ Created 12 check-in records for weeks 1-12');

  // 4. Create weekly progress records
  console.log('\n📈 Creating 12 weeks of progress tracking...');

  for (let week = 1; week <= 12; week++) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    await prisma.weeklyProgress.create({
      data: {
        userId,
        weekStart,
        weekEnd,
        weight: 86,
        averageCalories: 2200,
        averageProtein: 180,
        workoutsCompleted: 0,
        mealsCompleted: 0,
        notes: `Semana ${week} - Semanas no bloco: 12 | Meta: Reduzir gordura mantendo força`,
      },
    });
  }

  console.log('✅ Created 12 weekly progress records');

  // 5. Create user alerts with checklist items
  console.log('\n🎯 Creating weekly checklist alerts...');

  const checklistItems = [
    { title: 'Bater proteína', message: 'Meta: 180g/dia' },
    { title: 'Beber 3L de água', message: 'Aumentar consumo de 1,5L para 3L/dia' },
    { title: 'Treinar 3x + BJJ', message: 'Seg, Ter, Qui academia + Sex BJJ' },
    { title: 'Evitar fast food', message: 'Improviso zero ou mínimo' },
    { title: 'Registrar peso', message: 'Weigh-in 1x por semana' },
    { title: 'Dormir 7–8h', message: 'Consistência de sono' },
    { title: 'Levar lanche pronto', message: 'Preparar lanches proteicos' },
    { title: 'Avaliar cintura', message: 'Medição semanal' },
  ];

  for (const item of checklistItems) {
    await prisma.alert.create({
      data: {
        userId,
        title: item.title,
        message: item.message,
        isActive: true,
      },
    });
  }

  console.log('✅ Created 8 checklist alerts');

  // 6. Create coach notes with plan information
  console.log('\n📝 Creating coach notes with plan details...');

  const coachNotes = [
    'PLANO GUILHERME - 12 SEMANAS DE DEFINIÇÃO',
    'Objetivo: Reduzir gordura e preservar/ganhar massa magra (Recomposição corporal)',
    'Peso atual: 86kg | Meta: 80–83kg (Central: 81,5kg)',
    'Altura: 182cm | Idade: 20 anos',
    'Rotina: Acorda 6:40 | Dorme 23:00 | Sono 7–8h boa qualidade',
    'Refeições: 3–4/dia | Água atual: 1,5L → Meta: 3L/dia',
    'Treino: Academia 3–4 dias + BJJ',
    'Divisão: Seg (peito/tríceps/ombro) | Ter (costas/bíceps) | Qui (BJJ) | Sex (perna)',
    'Dificuldade: Alimentação e constância',
    'Preferências: Peixe e frango | Evitar: Preparações gordurosas (moela)',
    'Status: Ótima adesão esperada - foco em postura e aprendizado técnico nas 12 primeiras semanas',
  ];

  for (const note of coachNotes) {
    await prisma.coachNote.create({
      data: {
        userId,
        content: note,
      },
    });
  }

  console.log('✅ Created coach notes with plan overview');

  console.log('\n✨ Seed completed successfully!');
  console.log(`\n📊 Summary for ${user.name}:`);
  console.log('   - Exercises: 23 created');
  console.log('   - Meal bank options: 23 created');
  console.log('   - Check-in records: 12 created (weeks 1-12)');
  console.log('   - Weekly progress: 12 created');
  console.log('   - Alerts/Checklist: 8 created');
  console.log('   - Coach notes: 11 created');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
