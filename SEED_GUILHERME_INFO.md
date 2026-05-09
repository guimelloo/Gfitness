# Seed Data for Guilherme - Successfully Loaded ✅

## Seed Information

**Email:** `negromonteguilherme@gmail.com`  
**Seed Script:** `/backend/prisma/seed-guilherme.ts`  
**Executed:** April 19, 2026

## Data Summary

### User Profile
- **Name:** Guilherme
- **Age:** 20 years old
- **Height:** 182 cm
- **Current Weight:** 86 kg
- **Target Weight:** 80-83 kg (central: 81.5 kg)
- **Goal:** Body recomposition (reduce fat, gain muscle mass)
- **Goal Duration:** 12 weeks

### Nutrition Goals

**Training Days:**
- Calories: 2300 kcal
- Protein: 180g
- Carbs: 245g
- Fat: 66g

**Rest Days:**
- Calories: 2100 kcal
- Protein: 180g
- Carbs: 195g
- Fat: 70g

**Daily Water Goal:** 3.0 L

### Exercise Database
22 exercises created across all muscle groups:
- **Back:** Barra fixa, Remada curvada, Remada unilateral, Face pull
- **Biceps:** Rosca direta, Rosca alternada
- **Chest:** Supino reto, Supino inclinado, Paralelas, Flexão
- **Triceps:** Tríceps testa, Tríceps coice
- **Legs:** Agachamento livre, Terra romeno, Afundo, Agachamento goblet
- **Posterior:** Crucifixo invertido
- **Core:** Prancha, Farmer walk
- **Full Body:** Levantamento terra técnico, Desenvolvimento

### Meal Options (23 options)
- **Breakfast:** 4 options (R1A-R1D)
- **Lunch:** 4 options (R2A-R2D)
- **Pre-Workout:** 4 options (R3A-R3D)
- **Post-Workout:** 4 options (R4A-R4D)
- **Dinner:** 4 options (R5A-R5D)
- **Snack/Night:** 3 options (R7A-R7C)

Each meal includes:
- Total calories
- Protein (g)
- Carbs (g)
- Fat (g)

### Weekly Progress Records
12 weeks of empty progress records created, ready to track:
- Weekly weight
- Weekly averages for calories/protein
- Workouts completed
- Meals completed
- Notes

### Weekly Checklist (Alerts)
8 recurring alerts created:
1. ✅ Bater proteína (180g target)
2. ✅ Beber 3L de água
3. ✅ Treinar 3x + BJJ
4. ✅ Evitar fast food no improviso
5. ✅ Registrar peso 1x/sem
6. ✅ Dormir 7-8h
7. ✅ Levar lanche pronto
8. ✅ Avaliar cintura semanal

### Coach Notes
3 detailed notes created:
1. **Plan Overview** - 12-week recomposition strategy
2. **Nutritional Structure** - Macro breakdown and meal strategy
3. **Training Focus** - Technique-first approach and posture priorities

## Testing the Endpoints

### Test Profile Data Loading

**Endpoint:** `GET /users/profile`  
**Authentication:** Required (Bearer token)  
**Response on success:**

```json
{
  "id": "string",
  "userId": "string",
  "currentWeight": 86,
  "targetWeightMin": 80,
  "targetWeightMax": 83,
  "height": 182,
  "age": 20,
  "caloriesTrainingDay": 2300,
  "caloriesRestDay": 2100,
  "proteinDaily": 180,
  "carbsTrainingDay": 245,
  "carbsRestDay": 195,
  "fatTrainingDay": 66,
  "fatRestDay": 70,
  "waterGoal": 3.0,
  "WeekBlockNumber": 1,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Testing from Frontend

1. **Login** with email `negromonteguilherme@gmail.com`
2. **Click Avatar** in top-right corner of home page
3. **Navigate to Profile** page
4. **Verify** that all data loads correctly:
   - Body measurements (weight, height, age, target)
   - Training/Rest day macros
   - Hydration goal

## Database Verification

To manually verify the data in database:

```bash
# Connect to PostgreSQL and query
docker exec -it fitness_postgres psql -U postgres -d fitness_db

# Check UserProfile
SELECT * FROM "UserProfile" WHERE "userId" = 'd5d028e6-ab05-44f5-a7b8-c89c8d0ced30';

# Check meals count
SELECT COUNT(*) FROM "Meal" WHERE "userId" = 'd5d028e6-ab05-44f5-a7b8-c89c8d0ced30';

# Check exercises count
SELECT COUNT(*) FROM "Exercise";

# Check alerts
SELECT title FROM "Alert" WHERE "userId" = 'd5d028e6-ab05-44f5-a7b8-c89c8d0ced30';
```

## Notes

- All data is associated with user ID: `d5d028e6-ab05-44f5-a7b8-c89c8d0ced30`
- Exercises are shared globally (not user-specific)
- Meals are user-specific
- Weekly progress records span 12 weeks from today
- Alerts are user-specific and repeat weekly

## Prisma Studio

To view data visually:

```bash
cd backend
npm run prisma:studio
```

This opens Prisma Studio at http://localhost:5555
