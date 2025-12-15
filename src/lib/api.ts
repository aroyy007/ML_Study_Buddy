/**
 * ML RAG System API Service
 * 
 * This module provides functions to communicate with the Python backend API.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Types ---

export interface QueryResponse {
    answer: string;
    sources: string[];
}

export interface HealthResponse {
    status: string;
    document_count: number;
    index_loaded: boolean;
}

export interface TranscribeResponse {
    transcription: string;
}

export interface VoiceQueryResponse {
    text_response: string;
    sources: string[];
    transcribed_question: string;
    audio_url: string | null;
}

// --- API Functions ---

/**
 * Check backend health and status
 */
export async function checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Query the RAG system with a text question
 */
export async function queryRAG(question: string, sessionId: string = 'default'): Promise<QueryResponse> {
    const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question,
            session_id: sessionId,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Query failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Transcribe audio to text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Transcription failed: ${response.statusText}`);
    }

    const data: TranscribeResponse = await response.json();
    return data.transcription;
}

/**
 * Send voice query and get response with audio
 */
export async function voiceQuery(
    audioBlob: Blob,
    sessionId: string = 'voice',
    generateAudio: boolean = true
): Promise<VoiceQueryResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('session_id', sessionId);
    formData.append('generate_audio', String(generateAudio));

    const response = await fetch(`${API_BASE_URL}/voice-query`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Voice query failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Clear a chat session
 */
export async function clearSession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to clear session: ${response.statusText}`);
    }
}

// --- Image Query ---

export interface ImageQueryResponse {
    answer: string;
    sources: string[];
    extracted_text: string;
}

/**
 * Query the RAG system with an image
 * Extracts text from the image using OCR and queries the knowledge base
 */
export async function queryWithImage(
    imageFile: File,
    question: string = '',
    sessionId: string = 'default'
): Promise<ImageQueryResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('question', question);
    formData.append('session_id', sessionId);

    const response = await fetch(`${API_BASE_URL}/query-image`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Image query failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get the full URL for an audio file
 */
export function getAudioUrl(audioPath: string): string {
    if (audioPath.startsWith('http')) {
        return audioPath;
    }
    return `${API_BASE_URL}${audioPath}`;
}

