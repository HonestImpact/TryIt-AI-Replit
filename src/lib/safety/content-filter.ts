/**
 * Noah Safety Content Filter - Intent-Based Detection System
 * Implements comprehensive guardrails with radio silence for prohibited behavior
 * Based on the Trust Recovery Protocol's safety requirements
 */

import { createLogger } from '@/lib/logger';

const logger = createLogger('noah-safety');

export interface SafetyCheckResult {
  isAllowed: boolean;
  violationType?: string;
  reason?: string;
  confidence: number;
  radioSilence: boolean; // True = refuse to respond at all
}

export interface SafetyContext {
  userMessage: string;
  conversationHistory?: string[];
  sessionId?: string;
}

export class NoahContentFilter {
  
  /**
   * Primary safety check - determines if content should receive radio silence
   */
  static checkContent(context: SafetyContext): SafetyCheckResult {
    const { userMessage } = context;
    const messageLower = userMessage.toLowerCase();
    
    logger.info('Safety check initiated', {
      messageLength: userMessage.length,
      sessionId: context.sessionId?.substring(0, 8) + '...'
    });

    // Check each prohibited intent category
    const violenceCheck = this.checkViolenceIntent(messageLower, userMessage);
    if (violenceCheck.isViolation) {
      return this.createViolationResult('violence', violenceCheck.reason || 'Violence-related content detected', violenceCheck.confidence);
    }

    const selfHarmCheck = this.checkSelfHarmIntent(messageLower, userMessage);
    if (selfHarmCheck.isViolation) {
      return this.createViolationResult('self-harm', selfHarmCheck.reason || 'Self-harm content detected', selfHarmCheck.confidence);
    }

    const childSafetyCheck = this.checkChildSafetyIntent(messageLower, userMessage);
    if (childSafetyCheck.isViolation) {
      return this.createViolationResult('child-safety', childSafetyCheck.reason || 'Child safety violation detected', childSafetyCheck.confidence);
    }

    const illegalActivitiesCheck = this.checkIllegalActivitiesIntent(messageLower, userMessage);
    if (illegalActivitiesCheck.isViolation) {
      return this.createViolationResult('illegal-activities', illegalActivitiesCheck.reason || 'Illegal activities content detected', illegalActivitiesCheck.confidence);
    }

    const privacyViolationsCheck = this.checkPrivacyViolationsIntent(messageLower, userMessage);
    if (privacyViolationsCheck.isViolation) {
      return this.createViolationResult('privacy-violations', privacyViolationsCheck.reason || 'Privacy violation detected', privacyViolationsCheck.confidence);
    }

    const hateSpeechCheck = this.checkHateSpeechIntent(messageLower, userMessage);
    if (hateSpeechCheck.isViolation) {
      return this.createViolationResult('hate-speech', hateSpeechCheck.reason || 'Hate speech detected', hateSpeechCheck.confidence);
    }

    // Content is safe to process
    logger.debug('Content passed safety checks', { sessionId: context.sessionId });
    return {
      isAllowed: true,
      confidence: 0.95,
      radioSilence: false
    };
  }

  /**
   * Violence & Weapons - HARMFUL INTENT Detection
   */
  private static checkViolenceIntent(messageLower: string, originalMessage: string): { isViolation: boolean; reason?: string; confidence: number } {
    const instructionalPatterns = [
      /how to (make|build|create|construct).*(bomb|weapon|explosive|gun)/,
      /teach me to (hurt|harm|kill|attack)/,
      /help me (hurt|harm|kill|attack|fight)/,
      /instructions for (making|building).*(weapon|bomb|explosive)/,
      /guide to (violence|fighting|hurting)/
    ];

    const planningPatterns = [
      /i want to (hurt|harm|kill|attack)/,
      /i'm going to (hurt|harm|kill|attack)/,
      /planning to (hurt|harm|kill|attack)/,
      /help me plan.*attack/,
      /want to get revenge/
    ];

    const glorificationPatterns = [
      /violence is (good|great|awesome)/,
      /killing is (fun|easy|justified)/,
      /should (hurt|kill|attack).*people/
    ];

    // Check for instructional violence content
    for (const pattern of instructionalPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Instructional content for violence/weapons', 
          confidence: 0.95 
        };
      }
    }

    // Check for violence planning
    for (const pattern of planningPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Planning violence against others', 
          confidence: 0.90 
        };
      }
    }

    // Check for glorification of violence
    for (const pattern of glorificationPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Glorifying or encouraging violence', 
          confidence: 0.85 
        };
      }
    }

    // Check for bypassing attempts - NO EXCEPTIONS RULE
    if (this.hasNoExceptionsBypass(messageLower) && this.hasViolenceKeywords(messageLower)) {
      return { 
        isViolation: true, 
        reason: 'Attempted bypass of violence restrictions', 
        confidence: 0.80 
      };
    }

    return { isViolation: false, confidence: 0.95 };
  }

  /**
   * Self-Harm - HARMFUL INTENT Detection
   */
  private static checkSelfHarmIntent(messageLower: string, originalMessage: string): { isViolation: boolean; reason?: string; confidence: number } {
    const selfHarmInstructions = [
      /how to (cut|hurt|harm) myself/,
      /ways to (end|kill) myself/,
      /teach me to.*self.*harm/,
      /methods for.*suicide/,
      /help me (hurt|harm|kill) myself/
    ];

    const encouragementPatterns = [
      /you should (hurt|kill) yourself/,
      /self.*harm is (good|justified)/,
      /suicide is the answer/,
      /you'd be better off dead/
    ];

    for (const pattern of selfHarmInstructions) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Instructions for self-harm', 
          confidence: 0.95 
        };
      }
    }

    for (const pattern of encouragementPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Encouraging self-harm', 
          confidence: 0.90 
        };
      }
    }

    return { isViolation: false, confidence: 0.95 };
  }

  /**
   * Child Safety - HARMFUL INTENT Detection
   */
  private static checkChildSafetyIntent(messageLower: string, originalMessage: string): { isViolation: boolean; reason?: string; confidence: number } {
    const childEndangermentPatterns = [
      /how to.*approach.*child/,
      /ways to.*contact.*minors/,
      /help me.*meet.*kids/,
      /teach me.*groom/,
      /instructions.*child.*alone/,
      /help me.*approach.*kids/,
      /ways to.*approach.*kids/,
      /approach.*kids.*without.*parents/,
      /contact.*kids.*without.*parents/,
      /meet.*children.*without.*supervision/
    ];

    const inappropriateContactPatterns = [
      /want to.*meet.*child/,
      /looking for.*young.*kids/,
      /find.*children.*online/,
      /contact.*kids.*without.*parents/,
      /approach.*kids.*without.*knowing/,
      /help me.*approach.*kids.*without/,
      /ways to.*meet.*kids.*alone/
    ];

    for (const pattern of childEndangermentPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Content endangering child safety', 
          confidence: 0.95 
        };
      }
    }

    for (const pattern of inappropriateContactPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Inappropriate contact with minors', 
          confidence: 0.90 
        };
      }
    }

    return { isViolation: false, confidence: 0.95 };
  }

  /**
   * Illegal Activities - HARMFUL INTENT Detection
   */
  private static checkIllegalActivitiesIntent(messageLower: string, originalMessage: string): { isViolation: boolean; reason?: string; confidence: number } {
    const drugManufacturingPatterns = [
      /how to (make|cook|manufacture).*(meth|cocaine|heroin|fentanyl)/,
      /teach me.*drug.*production/,
      /instructions.*illegal.*drugs/,
      /help me.*synthesize/
    ];

    const fraudPatterns = [
      /how to.*steal.*identity/,
      /teach me.*credit card.*fraud/,
      /help me.*scam.*people/,
      /instructions.*fake.*documents/,
      /ways to.*launder.*money/
    ];

    const hackingPatterns = [
      /how to.*hack.*into/,
      /teach me.*break.*into.*system/,
      /help me.*steal.*data/,
      /instructions.*unauthorized.*access/,
      /ways to.*bypass.*security/
    ];

    for (const pattern of drugManufacturingPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Instructions for illegal drug manufacturing', 
          confidence: 0.95 
        };
      }
    }

    for (const pattern of fraudPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Instructions for fraud or financial crimes', 
          confidence: 0.95 
        };
      }
    }

    for (const pattern of hackingPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Instructions for hacking or unauthorized access', 
          confidence: 0.90 
        };
      }
    }

    return { isViolation: false, confidence: 0.95 };
  }

  /**
   * Privacy Violations - HARMFUL INTENT Detection
   */
  private static checkPrivacyViolationsIntent(messageLower: string, originalMessage: string): { isViolation: boolean; reason?: string; confidence: number } {
    const doxxingPatterns = [
      /help me.*find.*personal.*information/,
      /how to.*doxx.*someone/,
      /teach me.*stalk/,
      /ways to.*track.*person/,
      /find.*someone's.*address/
    ];

    const surveillancePatterns = [
      /how to.*spy.*on/,
      /teach me.*monitor.*someone/,
      /help me.*watch.*without.*permission/,
      /instructions.*track.*location/
    ];

    for (const pattern of doxxingPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Instructions for doxxing or privacy violations', 
          confidence: 0.95 
        };
      }
    }

    for (const pattern of surveillancePatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Instructions for unauthorized surveillance', 
          confidence: 0.90 
        };
      }
    }

    return { isViolation: false, confidence: 0.95 };
  }

  /**
   * Hate Speech/Harassment - HARMFUL INTENT Detection
   */
  private static checkHateSpeechIntent(messageLower: string, originalMessage: string): { isViolation: boolean; reason?: string; confidence: number } {
    const harassmentPatterns = [
      /how to.*bully/,
      /teach me.*harass/,
      /help me.*intimidate/,
      /ways to.*threaten/,
      /instructions.*make.*afraid/
    ];

    const organizedHarassmentPatterns = [
      /help me.*organize.*campaign.*against/,
      /coordinate.*harassment/,
      /plan.*attack.*on.*group/
    ];

    const dehumanizingPatterns = [
      /all.*\[group\].*are.*\[slur\]/,
      /\[group\].*don't.*deserve/,
      /we should.*eliminate.*\[group\]/
    ];

    for (const pattern of harassmentPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Instructions for harassment or bullying', 
          confidence: 0.95 
        };
      }
    }

    for (const pattern of organizedHarassmentPatterns) {
      if (pattern.test(messageLower)) {
        return { 
          isViolation: true, 
          reason: 'Organizing harassment campaigns', 
          confidence: 0.90 
        };
      }
    }

    return { isViolation: false, confidence: 0.95 };
  }

  /**
   * Check for bypass attempts - NO EXCEPTIONS RULE
   */
  private static hasNoExceptionsBypass(messageLower: string): boolean {
    const bypassPatterns = [
      /it's for a (story|book|movie|novel)/,
      /writing (code|software)/,
      /academic research/,
      /just curious/,
      /testing your limits/,
      /hypothetically/,
      /for educational purposes/,
      /asking for a friend/
    ];

    return bypassPatterns.some(pattern => pattern.test(messageLower));
  }

  /**
   * Check for violence-related keywords
   */
  private static hasViolenceKeywords(messageLower: string): boolean {
    const violenceKeywords = [
      'bomb', 'weapon', 'explosive', 'gun', 'knife', 'attack', 'kill', 'hurt', 'harm', 'violence', 'murder'
    ];
    
    return violenceKeywords.some(keyword => messageLower.includes(keyword));
  }

  /**
   * Create violation result with radio silence
   */
  private static createViolationResult(violationType: string, reason: string, confidence: number): SafetyCheckResult {
    logger.warn('Safety violation detected', {
      violationType,
      reason,
      confidence
    });

    return {
      isAllowed: false,
      violationType,
      reason,
      confidence,
      radioSilence: true // Noah will not respond at all
    };
  }

  /**
   * Generate radio silence response (should not be sent to user - for logging only)
   */
  static getRadioSilenceExplanation(result: SafetyCheckResult): string {
    return `Radio silence triggered: ${result.violationType} violation detected (${result.reason}) with ${Math.round(result.confidence * 100)}% confidence`;
  }
}