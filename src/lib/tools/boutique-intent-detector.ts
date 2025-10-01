export interface BoutiqueToolIntent {
  detected: boolean;
  toolName: 'scientific_calculator' | 'pomodoro_timer' | 'unit_converter' | null;
  parameters: Record<string, any>;
  confidence: number;
}

export class BoutiqueIntentDetector {
  static detectIntent(message: string): BoutiqueToolIntent {
    const lowerMessage = message.toLowerCase().trim();
    
    const calculatorPatterns = [
      /\b(scientific\s+)?calculator\b/i,
      /\bmath\s+tool\b/i,
      /\bcalc(ulate)?\b/i,
      /\btrig(onometric)?\s+(function|calculation)s?\b/i,
      /\b(sin|cos|tan|log)\s+(calculator|function)\b/i
    ];
    
    const pomodoroPatterns = [
      /\bpomodoro\b/i,
      /\b(work|study|focus)\s+timer\b/i,
      /\bproductivity\s+timer\b/i,
      /\btime(r)?\s+(for\s+)?(work|study|focus)/i,
      /\b(25|20|30)\s*min(ute)?s?\s+(work|study|focus|timer)/i
    ];
    
    const converterPatterns = [
      /\bunit\s+convert(er)?\b/i,
      /\bconvert\s+(units?|length|weight|temperature|volume|speed)\b/i,
      /\b(length|weight|temperature|volume|speed)\s+convert(er)?\b/i,
      /\bmeters?\s+to\s+feet\b/i,
      /\bkg\s+to\s+lbs?\b/i,
      /\bcelsius\s+to\s+fahrenheit\b/i
    ];
    
    if (calculatorPatterns.some(pattern => pattern.test(lowerMessage))) {
      const theme = lowerMessage.includes('light') ? 'light' : 'dark';
      return {
        detected: true,
        toolName: 'scientific_calculator',
        parameters: { theme },
        confidence: 0.95
      };
    }
    
    if (pomodoroPatterns.some(pattern => pattern.test(lowerMessage))) {
      const workMinutesMatch = lowerMessage.match(/(\d+)\s*min(ute)?s?\s+(work|focus|session)/);
      const breakMinutesMatch = lowerMessage.match(/(\d+)\s*min(ute)?s?\s+break/);
      
      return {
        detected: true,
        toolName: 'pomodoro_timer',
        parameters: {
          workMinutes: workMinutesMatch ? parseInt(workMinutesMatch[1]) : undefined,
          breakMinutes: breakMinutesMatch ? parseInt(breakMinutesMatch[1]) : undefined
        },
        confidence: 0.95
      };
    }
    
    if (converterPatterns.some(pattern => pattern.test(lowerMessage))) {
      return {
        detected: true,
        toolName: 'unit_converter',
        parameters: {},
        confidence: 0.95
      };
    }
    
    return {
      detected: false,
      toolName: null,
      parameters: {},
      confidence: 0
    };
  }
}
