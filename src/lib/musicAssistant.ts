interface UserContext {
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  currentInstrument?: string;
  lastTopics: string[];
  preferredGenres?: string[];
  currentScale?: string;
}

interface Response {
  type: string;
  context: UserContext;
  response: string;
}

interface ConversationMemory {
  context: UserContext;
  responses: Response[];
}

let memory: ConversationMemory = {
  context: {
    lastTopics: [],
    currentScale: 'C'
  },
  responses: []
};

const musicalTerms = {
  instruments: ['piano', 'guitare', 'basse', 'batterie', 'violon', 'synthétiseur'],
  genres: ['classique', 'jazz', 'rock', 'pop', 'électronique', 'hip-hop'],
  concepts: ['gamme', 'accord', 'rythme', 'mélodie', 'harmonie', 'composition'],
  levels: ['débutant', 'intermédiaire', 'avancé'],
  scales: {
    'C': ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
    'G': ['Sol', 'La', 'Si', 'Do', 'Ré', 'Mi', 'Fa#'],
    'D': ['Ré', 'Mi', 'Fa#', 'Sol', 'La', 'Si', 'Do#']
  }
};

function analyzeIntent(input: string): { intent: string; entities: Record<string, string> } {
  const lowercaseInput = input.toLowerCase();
  const entities: Record<string, string> = {};

  // Detect skill level
  for (const level of musicalTerms.levels) {
    if (lowercaseInput.includes(level)) {
      entities.skillLevel = level;
    }
  }

  // Detect instruments
  for (const instrument of musicalTerms.instruments) {
    if (lowercaseInput.includes(instrument)) {
      entities.instrument = instrument;
    }
  }

  // Detect genres
  for (const genre of musicalTerms.genres) {
    if (lowercaseInput.includes(genre)) {
      entities.genre = genre;
    }
  }

  // Detect main intent
  if (lowercaseInput.includes('apprendre') || lowercaseInput.includes('comment')) {
    return { intent: 'learning', entities };
  } else if (lowercaseInput.includes('jouer') || lowercaseInput.includes('pratiquer')) {
    return { intent: 'practice', entities };
  } else if (lowercaseInput.includes('composer') || lowercaseInput.includes('créer')) {
    return { intent: 'composition', entities };
  } else if (lowercaseInput.includes('théorie') || lowercaseInput.includes('comprendre')) {
    return { intent: 'theory', entities };
  }

  return { intent: 'general', entities };
}

function generateScaleResponse(scale: string): string {
  const notes = musicalTerms.scales[scale as keyof typeof musicalTerms.scales];
  return `La gamme de ${scale} majeur est composée des notes suivantes : ${notes.join(', ')}`;
}

function generatePersonalizedResponse(input: string, currentScale: string): string {
  const { intent, entities } = analyzeIntent(input);
  const context = memory.context;

  // Update context with new information
  if (entities.skillLevel) {
    context.skillLevel = entities.skillLevel as 'beginner' | 'intermediate' | 'advanced';
  }
  if (entities.instrument) {
    context.currentInstrument = entities.instrument;
  }
  if (entities.genre && !context.preferredGenres) {
    context.preferredGenres = [entities.genre];
  } else if (entities.genre) {
    context.preferredGenres?.push(entities.genre);
  }
  context.currentScale = currentScale;

  // Add current topic to lastTopics
  context.lastTopics.push(intent);
  if (context.lastTopics.length > 3) {
    context.lastTopics.shift();
  }

  // Generate personalized response based on intent and context
  let response = '';
  
  switch (intent) {
    case 'learning':
      response = generateLearningResponse(context, entities);
      break;
    case 'practice':
      response = generatePracticeResponse(context, entities);
      break;
    case 'composition':
      response = generateCompositionResponse(context, entities);
      break;
    case 'theory':
      response = generateTheoryResponse(context, entities);
      break;
    default:
      response = generateGeneralResponse(context, entities);
  }

  // Add scale information if relevant
  if (intent === 'theory' || intent === 'practice') {
    response += '\n\n' + generateScaleResponse(currentScale);
  }

  // Store response in memory
  memory.responses.push({
    type: intent,
    context: { ...context },
    response
  });

  return response;
}

function generateLearningResponse(context: UserContext, entities: Record<string, string>): string {
  const instrument = context.currentInstrument || entities.instrument || 'musique';
  const level = context.skillLevel || entities.skillLevel || 'débutant';
  const scale = context.currentScale || 'C';

  if (level === 'beginner') {
    return `Pour débuter en ${instrument} dans la gamme de ${scale}, je vous conseille de commencer par :\n\n` +
           `1. Apprendre les bases techniques de l'instrument\n` +
           `2. Comprendre la notation musicale de base\n` +
           `3. Pratiquer des exercices simples régulièrement\n\n` +
           `Voulez-vous que je vous guide sur l'un de ces aspects ?`;
  } else {
    return `Pour progresser en ${instrument} dans la gamme de ${scale}, voici quelques suggestions avancées :\n\n` +
           `1. Travailler sur des morceaux plus complexes\n` +
           `2. Approfondir la théorie harmonique\n` +
           `3. Explorer l'improvisation\n\n` +
           `Sur quel aspect souhaitez-vous vous concentrer ?`;
  }
}

function generatePracticeResponse(context: UserContext, entities: Record<string, string>): string {
  const instrument = context.currentInstrument || entities.instrument;
  const genre = context.preferredGenres?.[0] || entities.genre;
  const scale = context.currentScale || 'C';

  if (instrument && genre) {
    return `Pour pratiquer le ${instrument} en ${genre} dans la gamme de ${scale}, je vous suggère :\n\n` +
           `1. Des exercices techniques spécifiques au style\n` +
           `2. Des morceaux de référence à étudier\n` +
           `3. Des patterns rythmiques caractéristiques\n\n` +
           `Quel aspect vous intéresse le plus ?`;
  } else {
    return `Pour une pratique efficace dans la gamme de ${scale}, concentrez-vous sur :\n\n` +
           `1. La technique pure\n` +
           `2. Le rythme et la précision\n` +
           `3. L'expression musicale\n\n` +
           `Que souhaitez-vous travailler en priorité ?`;
  }
}

function generateCompositionResponse(context: UserContext, entities: Record<string, string>): string {
  const genre = context.preferredGenres?.[0] || entities.genre || 'général';
  const scale = context.currentScale || 'C';
  
  return `Pour composer en style ${genre} dans la gamme de ${scale}, voici une approche structurée :\n\n` +
         `1. Commencez par une progression d'accords simple\n` +
         `2. Ajoutez une mélodie qui suit l'harmonie\n` +
         `3. Développez le rythme et la structure\n\n` +
         `Voulez-vous que je détaille l'une de ces étapes ?`;
}

function generateTheoryResponse(context: UserContext, entities: Record<string, string>): string {
  const level = context.skillLevel || entities.skillLevel || 'débutant';
  const scale = context.currentScale || 'C';
  
  if (level === 'beginner') {
    return `Commençons par les bases de la théorie musicale dans la gamme de ${scale} :\n\n` +
           `1. Les notes et la portée\n` +
           `2. Les intervalles simples\n` +
           `3. Les accords de base\n\n` +
           `Quel concept voulez-vous explorer ?`;
  } else {
    return `Approfondissons la théorie musicale dans la gamme de ${scale} :\n\n` +
           `1. Les modes et les gammes avancées\n` +
           `2. L'harmonie fonctionnelle\n` +
           `3. Les modulations\n\n` +
           `Sur quel aspect souhaitez-vous vous concentrer ?`;
  }
}

function generateGeneralResponse(context: UserContext, entities: Record<string, string>): string {
  const scale = context.currentScale || 'C';

  if (context.lastTopics.length > 0) {
    const lastTopic = context.lastTopics[context.lastTopics.length - 1];
    return `Je vois que nous parlions de ${lastTopic} dans la gamme de ${scale}. Voulez-vous :\n\n` +
           `1. Continuer sur ce sujet\n` +
           `2. Explorer un nouveau concept\n` +
           `3. Mettre en pratique ce que nous avons vu\n\n` +
           `Que préférez-vous ?`;
  }

  return `Je peux vous aider avec la gamme de ${scale} pour :\n\n` +
         `1. L'apprentissage d'un instrument\n` +
         `2. La théorie musicale\n` +
         `3. La composition\n` +
         `4. La pratique et les exercices\n\n` +
         `Quel aspect vous intéresse ?`;
}

export function getResponse(input: string, currentScale: string = 'C'): string {
  return generatePersonalizedResponse(input, currentScale);
}