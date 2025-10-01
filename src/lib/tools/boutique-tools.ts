/**
 * Boutique Creative Tools - Direct Agent Tools using AI SDK
 * 
 * These are pre-built templates that Noah can invoke instantly (<100ms)
 * They feel like Noah's superpowers - instant, polished, ready to use
 */

import { tool } from 'ai';
import { z } from 'zod';
import { BOUTIQUE_TEMPLATES } from './boutique-templates';

export const boutiqueTools = {
  scientific_calculator: tool({
    description: 'Instantly creates a beautiful scientific calculator with trigonometric functions, logarithms, square roots, and constants (π, e). Perfect for math, physics, or engineering calculations.',
    parameters: z.object({
      theme: z.enum(['light', 'dark']).optional().describe('Color theme for the calculator. Dark theme is modern and sleek, light theme is clean and bright.'),
      features: z.array(z.string()).optional().describe('Optional array of additional features to highlight')
    }),
    execute: async ({ theme, features }: { theme?: 'light' | 'dark'; features?: string[] }) => {
      return {
        title: 'Scientific Calculator',
        content: BOUTIQUE_TEMPLATES.scientificCalculator(theme || 'dark', features)
      };
    }
  }),

  pomodoro_timer: tool({
    description: 'Creates a Pomodoro productivity timer with customizable work/break intervals. Includes session tracking, completion stats, and audio alerts. Perfect for focused work sessions.',
    parameters: z.object({
      workMinutes: z.number().min(1).max(60).optional().describe('Duration of work sessions in minutes (default: 25)'),
      breakMinutes: z.number().min(1).max(30).optional().describe('Duration of break sessions in minutes (default: 5)')
    }),
    execute: async ({ workMinutes, breakMinutes }: { workMinutes?: number; breakMinutes?: number }) => {
      return {
        title: 'Pomodoro Timer',
        content: BOUTIQUE_TEMPLATES.pomodoroTimer(workMinutes || 25, breakMinutes || 5)
      };
    }
  }),

  unit_converter: tool({
    description: 'Creates a comprehensive unit converter supporting length, weight, temperature, volume, and speed conversions. Interactive with real-time conversion and unit swapping.',
    parameters: z.object({
      categories: z.array(z.string()).optional().describe('Optional array of conversion categories to include (length, weight, temperature, volume, speed)')
    }),
    execute: async ({ categories }: { categories?: string[] }) => {
      return {
        title: 'Unit Converter',
        content: BOUTIQUE_TEMPLATES.unitConverter(categories)
      };
    }
  })
};

export type BoutiqueToolResult = {
  title: string;
  content: string;
};
