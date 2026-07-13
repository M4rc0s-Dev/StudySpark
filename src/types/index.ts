export type Difficulty = 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard'

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  concept?: string;
  difficulty?: Difficulty;
  studyMode?: 'basic' | 'timed' | 'spaced-repetition';
  studied?: boolean;
  correct?: boolean;
  timeSpent?: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

export interface StudySession {
  id: string;
  title: string;
  fileName?: string;
  folder?: string;
  color?: string;
  flashcards: Flashcard[];
  createdAt: Date;
  completedAt?: Date;
  studyMode: 'basic' | 'timed' | 'spaced-repetition';
  timeSpent?: number;
  score?: number;
}

export interface UploadResponse {
  sessionId: string;
  message?: string;
  flashcards?: Flashcard[];
}

export interface ProcessingProgress {
  stage: string;
  progress: number;
  message: string;
}

export interface ExportData {
  flashcards: Flashcard[];
  sessionId: string;
  exportDate: Date;
}

export type FileFormat = 'pdf' | 'txt' | 'docx';