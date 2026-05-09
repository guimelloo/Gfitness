import { API_BASE_URL } from './api-config';

interface ExerciseGif {
  name: string;
  mediaEndpoint?: string;
  gifUrl?: string | null;
  videoUrl?: string | null;
  videoQuery?: string;
  targetMuscle: string;
  equipment: string;
  instructions: string[];
}

interface ExerciseMediaResponse {
  gifUrl: string | null;
  videoUrl?: string | null;
}

export class ExerciseGifService {
  private static ENABLE_VIDEO_SEARCH_FALLBACK = true;

  private static buildVideoSearchUrl(query: string): string {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  }

  private static buildExerciseVideoQuery(exerciseName: string): string {
    return `${exerciseName} execução exercício academia`;
  }

  private static exerciseDatabase: { [key: string]: ExerciseGif } = {
    'barra fixa': {
      name: 'Barra Fixa',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/barra%20fixa`,
      videoQuery: 'barra fixa execução exercício academia',
      targetMuscle: 'costas',
      equipment: 'bar',
      instructions: ['Segure na barra com as mãos afastadas na largura dos ombros', 'Puxe o corpo para cima até o queixo passar da barra', 'Desça de forma controlada'],
    },
    'supino': {
      name: 'Supino com Barra',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/supino`,
      videoQuery: 'supino com barra execução exercício academia',
      targetMuscle: 'peito',
      equipment: 'barbell',
      instructions: ['Deite-se no banco com os pés no chão', 'Segure a barra na altura do peito', 'Empurre a barra para cima até os braços estarem estendidos', 'Abaixe de forma controlada'],
    },
    'agachamento': {
      name: 'Agachamento Livre',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/agachamento`,
      videoQuery: 'agachamento livre execução exercício academia',
      targetMuscle: 'perna',
      equipment: 'bodyweight',
      instructions: ['Fique em pé com os pés na largura dos ombros', 'Abaixe o quadril como se estivesse sentando', 'Mantenha o peso nos calcanhares', 'Suba voltando à posição inicial'],
    },
    'rosca direta': {
      name: 'Rosca Direta com Barra',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/rosca%20direta`,
      videoQuery: 'rosca direta com barra execução exercício academia',
      targetMuscle: 'biceps',
      equipment: 'barbell',
      instructions: ['Fique em pé com a barra nas mãos', 'Mantenha os cotovelos fixos ao corpo', 'Flexione os cotovelos trazendo a barra até os ombros', 'Abaixe de forma controlada'],
    },
    'prancha': {
      name: 'Prancha',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/prancha`,
      videoQuery: 'prancha execução exercício academia',
      targetMuscle: 'core',
      equipment: 'bodyweight',
      instructions: ['Deite-se de frente apoiado nos antebraços e dedos dos pés', 'Mantenha o corpo em linha reta', 'Contraia o abdômen', 'Mantenha a posição pelo tempo determinado'],
    },
    'remada': {
      name: 'Remada com Barra',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/remada`,
      videoQuery: 'remada com barra execução exercício academia',
      targetMuscle: 'costas',
      equipment: 'barbell',
      instructions: ['Incline o tronco para frente em 90 graus', 'Segure a barra com as mãos', 'Puxe a barra em direção ao abdômen', 'Volte lentamente à posição inicial'],
    },
    'flexão': {
      name: 'Flexão de Braço',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/flex%C3%A3o`,
      videoQuery: 'flexão de braço execução exercício academia',
      targetMuscle: 'peito',
      equipment: 'bodyweight',
      instructions: ['Deite-se com o corpo em linha reta apoiado nas mãos e dedos dos pés', 'Abaixe o corpo flexionando os cotovelos', 'Volte à posição inicial estendendo os braços completamente'],
    },
    'levantamento terra': {
      name: 'Levantamento Terra',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/levantamento%20terra`,
      videoQuery: 'levantamento terra execução exercício academia',
      targetMuscle: 'perna',
      equipment: 'barbell',
      instructions: ['Fique de pé com a barra sobre seus pés', 'Dobre os joelhos e agache-se para pegar a barra', 'Levante a barra até ficar em pé', 'Abaixe a barra de forma controlada'],
    },
    'desenvolvimento': {
      name: 'Desenvolvimento com Halter',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/desenvolvimento`,
      videoQuery: 'desenvolvimento com halter execução exercício academia',
      targetMuscle: 'ombro',
      equipment: 'dumbbell',
      instructions: ['Sente-se ou fique em pé com os halteres na altura dos ombros', 'Empurre os halteres para cima até estender os braços', 'Abaixe os halteres de forma controlada'],
    },
    'face pull': {
      name: 'Face Pull',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/face%20pull`,
      videoQuery: 'face pull execução exercício academia',
      targetMuscle: 'posterior',
      equipment: 'rope',
      instructions: ['Coloque a corda a altura dos olhos', 'Puxe a corda em sua direção', 'Separe as mãos puxando os cotovelos para trás', 'Volte lentamente'],
    },
    'crucifixo invertido': {
      name: 'Crucifixo Invertido',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/crucifixo%20invertido`,
      videoQuery: 'crucifixo invertido execução exercício academia',
      targetMuscle: 'posterior',
      equipment: 'dumbbell',
      instructions: ['Sente-se inclinado para trás com os halteres nas mãos', 'Levante os halteres com os braços levemente flexionados', 'Mantenha o movimento controlado', 'Abaixe lentamente'],
    },
    'mergulho': {
      name: 'Mergulho/Paralelas',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/mergulho`,
      videoQuery: 'mergulho paralelas execução exercício academia',
      targetMuscle: 'peito',
      equipment: 'bodyweight',
      instructions: ['Segure nas paralelas com os braços estendidos', 'Abaixe o corpo flexionando os cotovelos', 'Mantenha o tronco inclinado para frente', 'Suba voltando à posição inicial'],
    },
    'tríceps testa': {
      name: 'Tríceps Testa',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/tr%C3%ADceps%20testa`,
      videoQuery: 'tríceps testa execução exercício academia',
      targetMuscle: 'triceps',
      equipment: 'barbell',
      instructions: ['Deite-se no banco com a barra acima do peito', 'Abaixe a barra em direção à testa/cabeça', 'Mantenha os cotovelos fixos', 'Estenda os braços subindo a barra'],
    },
    'tríceps coice': {
      name: 'Tríceps Coice',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/tr%C3%ADceps%20coice`,
      videoQuery: 'tríceps coice execução exercício academia',
      targetMuscle: 'triceps',
      equipment: 'dumbbell',
      instructions: ['Incline o tronco para frente', 'Levante o halter colocando o cotovelo para trás', 'Estenda o braço completamente', 'Abaixe o halter retornando à posição inicial'],
    },
    'afundo': {
      name: 'Afundo com Halter',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/afundo`,
      videoQuery: 'afundo com halter execução exercício academia',
      targetMuscle: 'perna',
      equipment: 'dumbbell',
      instructions: ['Fique em pé com um halter em cada mão', 'Dê um passo para frente flexionando o joelho', 'Abaixe o corpo até o joelho de trás tocar o chão', 'Retorne à posição inicial e repita com a outra perna'],
    },
    'panturrilha': {
      name: 'Panturrilha em Pé',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/panturrilha`,
      videoQuery: 'panturrilha em pé execução exercício academia',
      targetMuscle: 'perna',
      equipment: 'bodyweight',
      instructions: ['Fique em pé com os pés na largura dos ombros', 'Eleve o corpo usando apenas os dedos do pé', 'Mantenha a posição alta por um segundo', 'Abaixe lentamente os calcanhares'],
    },
    'farmer walk': {
      name: 'Farmer Walk',
      mediaEndpoint: `${API_BASE_URL}/exercises/media/farmer%20walk`,
      videoQuery: 'farmer walk execução exercício academia',
      targetMuscle: 'core',
      equipment: 'dumbbell',
      instructions: ['Pegue em um halter em cada mão', 'Mantenha o corpo direito e o abdômen contraído', 'Caminhe em linha reta pela distância determinada', 'Mantenha boa postura o tempo todo'],
    },
  };

  static findExerciseGif(exerciseName: string): ExerciseGif | null {
    const normalizedName = exerciseName.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(this.exerciseDatabase)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return value;
      }
    }

    return null;
  }

  static getAllExercises(): ExerciseGif[] {
    return Object.values(this.exerciseDatabase);
  }

  static async searchExercise(query: string): Promise<ExerciseGif | null> {
    return this.findExerciseGif(query);
  }

  static async getExerciseMedia(exerciseName: string): Promise<ExerciseGif | null> {
    const exercise = this.findExerciseGif(exerciseName);
    const fallbackVideoUrl = this.ENABLE_VIDEO_SEARCH_FALLBACK
      ? this.buildVideoSearchUrl(
          exercise?.videoQuery || this.buildExerciseVideoQuery(exerciseName)
        )
      : null;

    if (!exercise?.mediaEndpoint) {
      return exercise
        ? { ...exercise, videoUrl: exercise.videoUrl || fallbackVideoUrl }
        : {
            name: exerciseName,
            gifUrl: null,
            videoUrl: fallbackVideoUrl,
            targetMuscle: '',
            equipment: '',
            instructions: [],
          };
    }

    try {
      const response = await fetch(exercise.mediaEndpoint);

      if (!response.ok) {
        return {
          ...exercise,
          gifUrl: exercise.gifUrl ?? null,
          videoUrl: exercise.videoUrl || fallbackVideoUrl,
        };
      }

      const media = (await response.json()) as ExerciseMediaResponse;

      return {
        ...exercise,
        gifUrl: media.gifUrl ?? null,
        videoUrl: media.videoUrl ?? fallbackVideoUrl,
      };
    } catch {
      return {
        ...exercise,
        gifUrl: exercise.gifUrl ?? null,
        videoUrl: exercise.videoUrl || fallbackVideoUrl,
      };
    }
  }
}
