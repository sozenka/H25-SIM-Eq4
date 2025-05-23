import { useState } from 'react';
import { Send, Bot, User, Brain, Music, Book, PlayCircle, Lightbulb, Settings2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore } from '../store/musicStore';

// Interface pour les messages
interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

// Interface pour les catégories
interface Category {
  id: string;
  title: string;
  icon: any;
  options: Option[];
}

// Interface pour les options
interface Option {
  id: string;
  label: string;
  response: string;
  followUp?: Option[];
}

// Message de bienvenue initial
const initialMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "👋 Bienvenue dans l'Assistant Musical ! Je suis là pour vous aider à explorer la musique. Choisissez une catégorie ci-dessous pour commencer."
};

// Catégories et leurs options
const categories: Category[] = [
  {
    id: 'theory',
    title: 'Théorie Musicale',
    icon: Book,
    options: [
      {
        id: 'scales',
        label: 'Les Gammes',
        response: 'Voici les gammes principales :\n\n1. Gamme Majeure (Do, Ré, Mi, Fa, Sol, La, Si)\n2. Gamme Mineure Naturelle\n3. Gamme Mineure Harmonique\n4. Gamme Pentatonique',
        followUp: [
          { id: 'major', label: 'Gamme Majeure', response: 'La gamme majeure est composée de : Tonique, 2nde Majeure, 3ce Majeure, 4te Juste, 5te Juste, 6te Majeure, 7ème Majeure' },
          { id: 'minor', label: 'Gamme Mineure', response: 'La gamme mineure naturelle est composée de : Tonique, 2nde Majeure, 3ce mineure, 4te Juste, 5te Juste, 6te mineure, 7ème mineure' }
        ]
      },
      {
        id: 'chords',
        label: 'Les Accords',
        response: 'Les types d\'accords principaux :\n\n1. Accords Majeurs (1-3-5)\n2. Accords Mineurs (1-♭3-5)\n3. Accords de Septième (1-3-5-7)\n4. Accords Diminués (1-♭3-♭5)',
        followUp: [
          { id: 'major-chords', label: 'Accords Majeurs', response: 'Un accord majeur est composé de la fondamentale, la tierce majeure et la quinte juste. Par exemple : Do-Mi-Sol' },
          { id: 'minor-chords', label: 'Accords Mineurs', response: 'Un accord mineur est composé de la fondamentale, la tierce mineure et la quinte juste. Par exemple : La-Do-Mi' }
        ]
      },
      {
        id: 'rhythm',
        label: 'Le Rythme',
        response: 'Éléments rythmiques fondamentaux :\n\n1. Mesures (4/4, 3/4, 6/8)\n2. Tempo et BPM\n3. Figures rythmiques (noires, croches, doubles-croches)\n4. Syncopes'
      }
    ]
  },
  {
    id: 'practice',
    title: 'Exercices Pratiques',
    icon: PlayCircle,
    options: [
      {
        id: 'beginner',
        label: 'Débutant',
        response: 'Exercices pour débutants :\n\n1. Échauffements basiques\n2. Gamme de Do Majeur\n3. Accords simples\n4. Rythmes de base',
        followUp: [
          { id: 'warmup', label: 'Échauffements', response: 'Commencez par 5-10 minutes d\'exercices techniques simples pour échauffer vos doigts et vos poignets.' },
          { id: 'basic-scales', label: 'Gammes Simples', response: 'Pratiquez la gamme de Do Majeur lentement, en montant puis en descendant. Concentrez-vous sur la régularité.' }
        ]
      },
      {
        id: 'intermediate',
        label: 'Intermédiaire',
        response: 'Exercices intermédiaires :\n\n1. Arpèges\n2. Gammes mineures\n3. Progressions d\'accords\n4. Exercices de vélocité'
      },
      {
        id: 'advanced',
        label: 'Avancé',
        response: 'Exercices avancés :\n\n1. Improvisation\n2. Modes\n3. Voicings complexes\n4. Polyrythmie'
      }
    ]
  },
  {
    id: 'composition',
    title: 'Composition',
    icon: Music,
    options: [
      {
        id: 'melody',
        label: 'Création de Mélodies',
        response: 'Techniques de création mélodique :\n\n1. Utiliser la gamme pentatonique\n2. Suivre la progression d\'accords\n3. Créer des motifs répétitifs\n4. Varier le rythme',
        followUp: [
          { id: 'pentatonic', label: 'Gamme Pentatonique', response: 'La gamme pentatonique est parfaite pour débuter la composition. Elle contient 5 notes qui sonnent toujours bien ensemble.' },
          { id: 'patterns', label: 'Motifs Mélodiques', response: 'Créez un motif simple de 3-4 notes et répétez-le en le modifiant légèrement à chaque fois.' }
        ]
      },
      {
        id: 'progression',
        label: 'Progressions d\'Accords',
        response: 'Progressions d\'accords communes :\n\n1. I-IV-V (Pop)\n2. ii-V-I (Jazz)\n3. I-vi-IV-V (Pop/Rock)\n4. i-iv-V (Blues)'
      },
      {
        id: 'structure',
        label: 'Structure du Morceau',
        response: 'Structures musicales courantes :\n\n1. Forme AABA\n2. Forme Couplet-Refrain\n3. Structure Blues 12 mesures\n4. Forme Rondo'
      }
    ]
  },
  {
    id: 'styles',
    title: 'Styles Musicaux',
    icon: Lightbulb,
    options: [
      {
        id: 'jazz',
        label: 'Jazz',
        response: 'Éléments du Jazz :\n\n1. Accords de septième\n2. Swing\n3. II-V-I progressions\n4. Improvisation',
        followUp: [
          { id: 'swing', label: 'Le Swing', response: 'Le swing est caractérisé par un rythme ternaire où les croches sont jouées de manière inégale.' },
          { id: 'jazz-chords', label: 'Accords Jazz', response: 'Les accords de jazz utilisent souvent des extensions : septièmes, neuvièmes, onzièmes, treizièmes.' }
        ]
      },
      {
        id: 'classical',
        label: 'Classique',
        response: 'Éléments de la musique classique :\n\n1. Forme Sonate\n2. Développement thématique\n3. Cadences\n4. Modulations'
      },
      {
        id: 'rock',
        label: 'Rock',
        response: 'Éléments du Rock :\n\n1. Power Chords\n2. Riffs\n3. Structures couplet-refrain\n4. Patterns de batterie'
      }
    ]
  }
];

const AiSuggestions = () => {
  const { currentScale, setScale } = useMusicStore();
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);

  // Gérer la sélection d'une catégorie
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedOption(null);
    setShowFollowUp(false);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: `Je voudrais en savoir plus sur ${category.title}`
      }
    ]);
  };

  // Gérer la sélection d'une option
  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option);
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: option.label },
      { id: (Date.now() + 1).toString(), role: 'assistant', content: option.response }
    ]);
    setShowFollowUp(!!option.followUp);
  };

  return (
    <div className="relative bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl rounded-xl border border-primary/20 flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 animate-gradient" />
      
      <div className="relative z-10 p-6 border-b border-primary/20 flex items-center justify-between bg-background/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <Brain className="w-8 h-8 text-primary animate-pulse-slow" />
            <div className="absolute inset-0 w-8 h-8 bg-primary/20 rounded-full blur-xl" />
          </div>
          <h2 className="text-3xl font-bold text-white">Assistant Musical</h2>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-primary-light">Gamme actuelle:</span>
          <select
            value={currentScale}
            onChange={(e) => setScale(e.target.value)}
            className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-1 text-white focus:border-primary/50 focus:ring focus:ring-primary/20 transition-all"
          >
            <option value="C">Do majeur</option>
            <option value="G">Sol majeur</option>
            <option value="D">Ré majeur</option>
          </select>
        </motion.div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleCategorySelect(category)}
              className={clsx(
                'group p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 hover:scale-[1.02]',
                selectedCategory?.id === category.id
                  ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20'
                  : 'bg-background/40 border-primary/20 hover:bg-primary/10 hover:border-primary/40'
              )}
            >
              <category.icon className={clsx(
                'w-6 h-6 transition-colors duration-300',
                selectedCategory?.id === category.id ? 'text-primary' : 'text-primary-light group-hover:text-primary'
              )} />
              <span className="text-white font-medium">{category.title}</span>
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {selectedCategory.options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleOptionSelect(option)}
                  className={clsx(
                    'group p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 hover:scale-[1.02]',
                    selectedOption?.id === option.id
                      ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20'
                      : 'bg-background/40 border-primary/20 hover:bg-primary/10 hover:border-primary/40'
                  )}
                >
                  <span className="text-white font-medium">{option.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showFollowUp && selectedOption?.followUp && (
            <motion.div
              key="followUp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {selectedOption.followUp.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleOptionSelect(option)}
                  className={clsx(
                    'group p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 hover:scale-[1.02]',
                    'bg-background/40 border-primary/20 hover:bg-primary/10 hover:border-primary/40'
                  )}
                >
                  <span className="text-white font-medium">{option.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                'flex gap-4 p-4 rounded-xl',
                message.role === 'assistant'
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-background/40 border border-primary/20'
              )}
            >
              <div className="flex-shrink-0">
                {message.role === 'assistant' ? (
                  <Bot className="w-6 h-6 text-primary" />
                ) : (
                  <User className="w-6 h-6 text-primary-light" />
                )}
              </div>
              <div className="flex-1">
                <ReactMarkdown className="prose prose-invert max-w-none">
                  {message.content}
                </ReactMarkdown>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiSuggestions;