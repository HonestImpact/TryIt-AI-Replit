export interface BoutiqueToolIntent {
  detected: boolean;
  toolName: 'scientific_calculator' | 'pomodoro_timer' | 'unit_converter' | 'assumption_breaker' | 'time_telescope' | null;
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
    
    const assumptionBreakerPatterns = [
      { pattern: /\bassumption\s+breaker\b/i, confidence: 0.95 },
      { pattern: /\bchallenge\s+(my\s+)?assumptions?\b/i, confidence: 0.93 },
      { pattern: /\bbreak\s+(my\s+)?assumptions?\b/i, confidence: 0.93 },
      { pattern: /\bquestion\s+(my\s+)?assumptions?\b/i, confidence: 0.92 },
      { pattern: /\btest\s+(my\s+)?assumptions?\b/i, confidence: 0.91 },
      { pattern: /\bthink\s+differently\b/i, confidence: 0.88 },
      { pattern: /\breframe\s+(my\s+)?(problem|thinking|perspective)\b/i, confidence: 0.90 },
      { pattern: /\bwhat\s+am\s+i\s+assuming\b/i, confidence: 0.93 },
      { pattern: /\bidentify\s+(my\s+)?assumptions?\b/i, confidence: 0.91 },
      { pattern: /\bblind\s+spots?\b/i, confidence: 0.87 },
      { pattern: /\bhidden\s+assumptions?\b/i, confidence: 0.92 },
      { pattern: /\bunconsciou(s|sly)\s+assuming\b/i, confidence: 0.90 }
    ];
    
    const timeTelescopePatterns = [
      { pattern: /\btime\s+telescope\b/i, confidence: 0.95 },
      { pattern: /\bview\s+(my\s+)?decision\s+(across|over|through)\s+time\b/i, confidence: 0.93 },
      { pattern: /\bperspective\s+(on|over)\s+time\b/i, confidence: 0.92 },
      { pattern: /\btime\s+(perspective|horizon)s?\b/i, confidence: 0.93 },
      { pattern: /\b(decision|choice)\s+perspective\s+tool\b/i, confidence: 0.91 },
      { pattern: /\bview\s+through\s+time\b/i, confidence: 0.92 },
      { pattern: /\blong[- ]term\s+(perspective|view)\b/i, confidence: 0.88 },
      { pattern: /\bhow\s+(will|would)\s+this\s+(look|matter|seem)\s+in\s+\d+\s+(year|month|day)s?\b/i, confidence: 0.90 },
      { pattern: /\bfuture\s+(perspective|view|outlook)\b/i, confidence: 0.87 },
      { pattern: /\bdecision\s+paralysis\b/i, confidence: 0.89 },
      { pattern: /\b(help|show|view)\s+(me\s+)?(see|understand)\s+(my\s+)?(decision|choice)\s+(from\s+)?(different|multiple)\s+(time|perspective)s?\b/i, confidence: 0.92 },
      { pattern: /\b(stuck|struggling)\s+(on|with)\s+a\s+(decision|choice)\b/i, confidence: 0.88 }
    ];
    
    let maxConfidence = 0;
    let detectedTool: 'scientific_calculator' | 'pomodoro_timer' | 'unit_converter' | 'assumption_breaker' | 'time_telescope' | null = null;
    
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
    
    for (const { pattern, confidence } of assumptionBreakerPatterns) {
      if (pattern.test(lowerMessage) && confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedTool = 'assumption_breaker';
      }
    }
    
    for (const { pattern, confidence } of timeTelescopePatterns) {
      if (pattern.test(lowerMessage) && confidence > maxConfidence) {
        maxConfidence = confidence;
        detectedTool = 'time_telescope';
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
    
    if (detectedTool === 'assumption_breaker') {
      return {
        detected: true,
        toolName: 'assumption_breaker',
        parameters: {},
        confidence: maxConfidence
      };
    }
    
    if (detectedTool === 'time_telescope') {
      const theme = lowerMessage.includes('light') ? 'light' : 'dark';
      return {
        detected: true,
        toolName: 'time_telescope',
        parameters: { theme },
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
