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
      { pattern: /\b(scientific\s+)?calculator\b/i, confidence: 0.95 },
      { pattern: /\bmath\s+(tool|calculator)\b/i, confidence: 0.95 },
      { pattern: /\bcalc(ulate)?\b/i, confidence: 0.90 },
      { pattern: /\bopen\s+a\s+calc/i, confidence: 0.92 },
      { pattern: /\bscientific\s+calc/i, confidence: 0.95 },
      { pattern: /\btrig(onometric)?\s+(function|calculation)s?\b/i, confidence: 0.93 },
      { pattern: /\b(sin|cos|tan|log)\s+(calculator|function)\b/i, confidence: 0.92 },
      { pattern: /\bdo\s+\d+[\s*+\-\/]\d+/i, confidence: 0.88 }
    ];
    
    const pomodoroPatterns = [
      { pattern: /\bpomodoro\b/i, confidence: 0.95 },
      { pattern: /\btomato\s+timer\b/i, confidence: 0.93 },
      { pattern: /\b(work|study|focus)\s+timer\b/i, confidence: 0.92 },
      { pattern: /\bproductivity\s+timer\b/i, confidence: 0.93 },
      { pattern: /\btime(r)?\s+(for\s+)?(work|study|focus)/i, confidence: 0.90 },
      { pattern: /\bwork\s+session\s+timer\b/i, confidence: 0.92 },
      { pattern: /\bstart\s+(a\s+)?(\d+\/\d+\s+)?pomodoro/i, confidence: 0.95 },
      { pattern: /\bstart\s+focus\s+\d+\/\d+/i, confidence: 0.92 },
      { pattern: /\b(25|20|30|50)\s*[/-]\s*\d+\s*(min(ute)?s?)?\b/i, confidence: 0.91 },
      { pattern: /\b(25|20|30)\s*(min(ute)?s?|m)?\s+(work|study|focus|timer)/i, confidence: 0.90 }
    ];
    
    const converterPatterns = [
      { pattern: /\bunit\s+convert(er)?\b/i, confidence: 0.95 },
      { pattern: /\bconvert\s+(units?|length|weight|temperature|volume|speed)\b/i, confidence: 0.95 },
      { pattern: /\b(length|weight|temperature|volume|speed)\s+convert(er)?\b/i, confidence: 0.94 },
      { pattern: /\btemperature\s+converter\b/i, confidence: 0.95 },
      { pattern: /\blength\s+converter\b/i, confidence: 0.95 },
      { pattern: /\bmeters?\s+to\s+feet\b/i, confidence: 0.93 },
      { pattern: /\bfeet\s+to\s+meters?\b/i, confidence: 0.93 },
      { pattern: /\bkg\s+to\s+(lbs?|pounds?)\b/i, confidence: 0.93 },
      { pattern: /\b(lbs?|pounds?)\s+to\s+kg\b/i, confidence: 0.93 },
      { pattern: /\b(celsius|°c)\s+to\s+(fahrenheit|°f)\b/i, confidence: 0.93 },
      { pattern: /\b(fahrenheit|°f)\s+to\s+(celsius|°c)\b/i, confidence: 0.93 },
      { pattern: /\bconvert\s+\d+\s*([a-z]{1,3})\s+to\s+([a-z]{1,3})/i, confidence: 0.88 },
      { pattern: /\b(m|ft|km|mi|lb|kg|mph|kph|°c|°f)\s+to\s+(m|ft|km|mi|lb|kg|mph|kph|°c|°f)\b/i, confidence: 0.90 }
    ];
    
    let maxConfidence = 0;
    let detectedTool: 'scientific_calculator' | 'pomodoro_timer' | 'unit_converter' | null = null;
    
    for (const { pattern, confidence } of calculatorPatterns) {
      if (pattern.test(lowerMessage) && confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedTool = 'scientific_calculator';
      }
    }
    
    for (const { pattern, confidence } of pomodoroPatterns) {
      if (pattern.test(lowerMessage) && confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedTool = 'pomodoro_timer';
      }
    }
    
    for (const { pattern, confidence } of converterPatterns) {
      if (pattern.test(lowerMessage) && confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedTool = 'unit_converter';
      }
    }
    
    if (detectedTool === 'scientific_calculator') {
      const theme = lowerMessage.includes('light') ? 'light' : 'dark';
      return {
        detected: true,
        toolName: 'scientific_calculator',
        parameters: { theme },
        confidence: maxConfidence
      };
    }
    
    if (detectedTool === 'pomodoro_timer') {
      const workMinutesMatch = lowerMessage.match(/(\d+)\s*[/-]?\s*\d*\s*(min(ute)?s?|m)?\s+(work|focus|session)/);
      const breakMinutesMatch = lowerMessage.match(/(\d+)\s*[/-]?\s*(\d+)\s*(min(ute)?s?|m)?/);
      const slashMatch = lowerMessage.match(/(\d+)\s*[/-]\s*(\d+)/);
      
      let workMinutes: number | undefined;
      let breakMinutes: number | undefined;
      
      if (slashMatch) {
        workMinutes = parseInt(slashMatch[1]);
        breakMinutes = parseInt(slashMatch[2]);
      } else {
        workMinutes = workMinutesMatch ? parseInt(workMinutesMatch[1]) : undefined;
        breakMinutes = breakMinutesMatch && breakMinutesMatch[2] ? parseInt(breakMinutesMatch[2]) : undefined;
      }
      
      return {
        detected: true,
        toolName: 'pomodoro_timer',
        parameters: {
          workMinutes,
          breakMinutes
        },
        confidence: maxConfidence
      };
    }
    
    if (detectedTool === 'unit_converter') {
      return {
        detected: true,
        toolName: 'unit_converter',
        parameters: {},
        confidence: maxConfidence
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
