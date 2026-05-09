import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

type ExerciseMedia = {
  gifUrl: string | null;
  videoUrl: string | null;
  source: 'database' | 'fallback' | 'none';
};

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  // GIFs em base64 (SVG animados convertidos para data URI)
  private exerciseGifs = new Map<string, string>([
    ['barra fixa', this.generatePullupGif()],
    ['supino', this.generateBenchPressGif()],
    ['agachamento', this.generateSquatGif()],
    ['rosca direta', this.generateCurlGif()],
    ['prancha', this.generatePlankGif()],
    ['remada', this.generateRowGif()],
    ['flexão', this.generatePushupGif()],
    ['levantamento terra', this.generateDeadliftGif()],
    ['desenvolvimento', this.generateShoulderPressGif()],
    ['face pull', this.generateFacePullGif()],
    ['crucifixo invertido', this.generateFlieGif()],
    ['mergulho', this.generateDipGif()],
    ['tríceps testa', this.generateSkullCrusherGif()],
    ['tríceps coice', this.generateTricepKickbackGif()],
    ['afundo', this.generateLungeGif()],
    ['panturrilha', this.generateCalfRaiseGif()],
    ['farmer walk', this.generateFarmerWalkGif()],
  ]);

  private generateSimpleAnimatedGif(frames: string[]): string {
    // Retorna um SVG simples com animação CSS como data URI base64
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <style>
          @keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
          .pulse { animation: blink 1s infinite; }
        </style>
        <rect width="200" height="200" fill="#f5f5f5"/>
        <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" font-size="80" class="pulse">
          ${frames[0]}
        </text>
      </svg>
    `;
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  // Métodos geradores para cada exercício
  private generatePullupGif() {
    return this.generateSimpleAnimatedGif(['🤸']);
  }
  private generateBenchPressGif() {
    return this.generateSimpleAnimatedGif(['💪']);
  }
  private generateSquatGif() {
    return this.generateSimpleAnimatedGif(['🦵']);
  }
  private generateCurlGif() {
    return this.generateSimpleAnimatedGif(['💪']);
  }
  private generatePlankGif() {
    return this.generateSimpleAnimatedGif(['📍']);
  }
  private generateRowGif() {
    return this.generateSimpleAnimatedGif(['🏋️']);
  }
  private generatePushupGif() {
    return this.generateSimpleAnimatedGif(['💪']);
  }
  private generateDeadliftGif() {
    return this.generateSimpleAnimatedGif(['⛹️']);
  }
  private generateShoulderPressGif() {
    return this.generateSimpleAnimatedGif(['💪']);
  }
  private generateFacePullGif() {
    return this.generateSimpleAnimatedGif(['👃']);
  }
  private generateFlieGif() {
    return this.generateSimpleAnimatedGif(['🦅']);
  }
  private generateDipGif() {
    return this.generateSimpleAnimatedGif(['🤸']);
  }
  private generateSkullCrusherGif() {
    return this.generateSimpleAnimatedGif(['💪']);
  }
  private generateTricepKickbackGif() {
    return this.generateSimpleAnimatedGif(['💪']);
  }
  private generateLungeGif() {
    return this.generateSimpleAnimatedGif(['🦵']);
  }
  private generateCalfRaiseGif() {
    return this.generateSimpleAnimatedGif(['🦵']);
  }
  private generateFarmerWalkGif() {
    return this.generateSimpleAnimatedGif(['👜']);
  }

  getExerciseGifData(exerciseName: string): string | null {
    const normalized = this.normalizeExerciseName(exerciseName);

    for (const [key, value] of this.exerciseGifs.entries()) {
      if (this.normalizeExerciseName(key) === normalized) {
        return value;
      }
    }

    return null;
  }

  private normalizeExerciseName(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private findMatchingKey(exerciseName: string): string | null {
    const normalizedName = this.normalizeExerciseName(exerciseName);

    for (const key of this.exerciseGifs.keys()) {
      const normalizedKey = this.normalizeExerciseName(key);

      if (
        normalizedName === normalizedKey ||
        normalizedName.includes(normalizedKey) ||
        normalizedKey.includes(normalizedName)
      ) {
        return key;
      }
    }

    return null;
  }

  async getExerciseMedia(exerciseName: string): Promise<ExerciseMedia> {
    const normalizedName = this.normalizeExerciseName(exerciseName);
    const exercises = await this.prisma.exercise.findMany({
      select: {
        name: true,
        gifUrl: true,
      },
    });

    const matchedExercise = exercises.find((exercise) => {
      const normalizedExerciseName = this.normalizeExerciseName(exercise.name);

      return (
        normalizedExerciseName === normalizedName ||
        normalizedExerciseName.includes(normalizedName) ||
        normalizedName.includes(normalizedExerciseName)
      );
    });

    if (matchedExercise?.gifUrl) {
      return {
        gifUrl: matchedExercise.gifUrl,
        videoUrl: null,
        source: 'database',
      };
    }

    const fallbackKey = this.findMatchingKey(exerciseName);

    if (fallbackKey) {
      return {
        gifUrl: this.exerciseGifs.get(fallbackKey) ?? null,
        videoUrl: null,
        source: 'fallback',
      };
    }

    return {
      gifUrl: null,
      videoUrl: null,
      source: 'none',
    };
  }

  async create(data: CreateExerciseDto) {
    return this.prisma.exercise.create({ data });
  }

  async findAll() {
    return this.prisma.exercise.findMany();
  }

  async findOne(id: string) {
    return this.prisma.exercise.findUnique({ where: { id } });
  }

  async findByMuscleGroup(muscleGroup: string) {
    return this.prisma.exercise.findMany({ where: { muscleGroup } });
  }

  async update(id: string, data: UpdateExerciseDto) {
    return this.prisma.exercise.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.exercise.delete({ where: { id } });
  }
}
