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
  }),

  assumption_breaker: tool({
    description: 'Creates an Assumption Breaker tool that helps challenge and reframe assumptions about any problem or decision. Perfect for skeptics who want to think differently. Users describe their problem, and the tool generates 5-7 likely assumptions they can toggle on/off to see their problem reframed. Includes intelligent assumption generation for career, business, relationship, and decision-making contexts.',
    parameters: z.object({}),
    execute: async () => {
      return {
        title: 'Assumption Breaker',
        content: BOUTIQUE_TEMPLATES.assumptionBreaker()
      };
    }
  }),

  time_telescope: tool({
    description: 'Creates a Time Telescope tool that helps view decisions across multiple time horizons (1 day, 1 year, 10 years, 100 years). Perfect for decision paralysis and gaining perspective. Users describe a decision, and the tool generates thoughtful perspectives showing how the decision looks from different time scales. Includes SVG timeline visualization, zoom controls, and perspective cards with psychological insights. Simple but philosophically profound.',
    parameters: z.object({
      theme: z.enum(['light', 'dark']).optional().describe('Color theme for the tool. Dark theme is modern and contemplative, light theme is clean and clear.')
    }),
    execute: async ({ theme }: { theme?: 'light' | 'dark' }) => {
      return {
        title: 'Time Telescope',
        content: BOUTIQUE_TEMPLATES.timeTelescope(theme || 'dark')
      };
    }
  }),

  energy_archaeology: tool({
    description: 'Creates an Energy Archaeology tool that tracks what gives/drains energy throughout the day to create a personal energy map. This is a unique differentiator that helps optimize schedules to energy patterns. Users log activities with energy levels, and the tool creates a Chart.js visualization showing energy curves, pattern analysis (peak times, energy boosters/drainers), and insights about when they are most creative, social, or analytical. Includes 7-day rolling view, quick-logging interface, and pattern detection. Privacy-conscious - all data stays local.',
    parameters: z.object({}),
    execute: async () => {
      return {
        title: 'Energy Archaeology',
        content: BOUTIQUE_TEMPLATES.energyArchaeology()
      };
    }
  })
};

export type BoutiqueToolResult = {
  title: string;
  content: string;
};
