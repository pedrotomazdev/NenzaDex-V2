/*
 * Projeto: NenzaDex V2
 * Autor: Pedro Tomaz Rezende Fagundes
 * GitHub: https://github.com/pedrotomazdev
 *
 * ⚠️ Uso permitido APENAS com atribuição.
 * Proibido remover créditos ou redistribuir como se fosse autor original.
 */

// Vercel Speed Insights Integration
import { injectSpeedInsights } from 'https://cdn.jsdelivr.net/npm/@vercel/speed-insights@2.0.0/+esm';

// Initialize Speed Insights with default configuration
// This will track web vitals and performance metrics
injectSpeedInsights({
    debug: false, // Set to true for debugging in development
});
