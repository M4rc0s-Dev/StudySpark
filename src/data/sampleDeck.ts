import { StudySession } from '../types'

export const sampleDeck: StudySession = {
  id: 'demo',
  title: 'Mazo de demostración',
  createdAt: new Date(),
  studyMode: 'basic',
  timeSpent: 0,
  score: 0,
  flashcards: [
    {
      id: 'd1',
      question: '¿Cuáles son las tres leyes de Newton?',
      answer:
        '1. Inercia: un cuerpo mantiene su estado de reposo o movimiento. 2. Fuerza = masa × aceleración. 3. Acción y reacción: toda fuerza tiene una igual y opuesta.',
      concept: 'Física',
      difficulty: 'easy',
    },
    {
      id: 'd2',
      question: '¿Qué es la fotosíntesis y por qué importa?',
      answer:
        'Es el proceso por el que las plantas convierten luz, agua y CO₂ en glucosa y oxígeno. Sostiene la cadena alimentaria y produce el oxígeno que respiramos.',
      concept: 'Biología',
      difficulty: 'medium',
    },
    {
      id: 'd3',
      question: 'Explica la diferencia entre PCR y RCP.',
      answer:
        'PCR (reacción en cadena de la polimerasa) es una técnica de laboratorio para amplificar ADN. RCP (reanimación cardiopulmonar) es una maniobra de primeros auxilios para mantener la circulación.',
      concept: 'Ciencia',
      difficulty: 'hard',
    },
    {
      id: 'd4',
      question: '¿Qué fue la Revolución Industrial?',
      answer:
        'Un periodo (siglos XVIII-XIX) de transición de la producción manual a la mecanizada, impulsada por el vapor y la fábrica, que transformó economía y sociedad.',
      concept: 'Historia',
      difficulty: 'medium',
    },
  ],
}
