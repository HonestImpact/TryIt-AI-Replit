/**
 * Add "TryIt A.I. Blues" song knowledge to ChromaDB
 * Run once to populate Noah's knowledge base with information about the landing page song
 */

import { vectorStore } from '../rag/vector-store';
import type { DocumentChunk } from '../rag/vector-store';

async function addSongKnowledge() {
  console.log('🎵 Adding TryIt A.I. Blues knowledge to vector store...');

  const documents: DocumentChunk[] = [
    {
      id: 'tryit-ai-blues-overview',
      content: `Song Overview: "TryIt A.I. Blues"
      
This is an old-school blues song that introduces the TryIt-AI agent for skeptics. The song is featured on the landing page of the Noah app. It was created on September 21, 2025 by Isak Griffiths using SUNO AI (paid version).

The song represents Isak's excitement when she successfully created and posted her first AI Agent. It embodies the app's philosophy of helping skeptical users find genuine value in AI technology.

The music video shows a dragonfly made of computer electronic parts over a black background, with lyrics appearing superimposed over the image. The song is on the landing page because it's fun, it's about TryIt AI, and it helps describe why Isak Griffiths created the app and what she hopes it means to people.`,
      metadata: {
        source: 'TryIt A.I. Blues - Song Information',
        type: 'knowledge',
        timestamp: new Date().toISOString(),
        category: 'app-origin-story'
      }
    },
    {
      id: 'tryit-ai-blues-creation',
      content: `Creation Story: How "TryIt A.I. Blues" Was Made

When Isak Griffiths successfully created and posted her first AI Agent, she was so excited that she wrote a song! The lyrics were collaboratively developed by Isak Griffiths and Claude.ai.

The creative process:
1. Isak developed a comprehensive concept for the song
2. She asked Claude to draft lyrics for a blues song based on her concept
3. Isak reworked the lyrics and tested several versions
4. She finalized the lyrics for Suno with a detailed description of the desired music, instrumentals, and vocals
5. The music honors and embraces the ability of raw blues with world-class guitar work

The song captures the journey from AI skepticism to finding genuine value in technology that respects human agency.`,
      metadata: {
        source: 'TryIt A.I. Blues - Creation Story',
        type: 'knowledge',
        timestamp: new Date().toISOString(),
        category: 'app-origin-story'
      }
    },
    {
      id: 'tryit-ai-blues-themes',
      content: `Song Themes and Meaning: "TryIt A.I. Blues"

The song explores the tension between AI skepticism and finding genuine helpful technology:

Key Themes:
- Fear that AI will "steal my soul" and "replace my heart with digital coal"
- Frustration with overpromising AI that sells "broken dreams"
- The journey from distrust to discovering an AI that actually listens and helps
- Finding technology that enhances rather than replaces human thinking
- Moving from "lies and schemes" to "digital dreams"
- The possibility that "maybe there's some tech in my soul"

The chorus introduces the app's core message: "Try it A.I." - suggesting that one small thing can reduce the dread, one small thing that actually works, helping users "do better in thinking like me."

This captures the app's mission: to help skeptical users find AI tools that genuinely serve their needs without compromising their autonomy.`,
      metadata: {
        source: 'TryIt A.I. Blues - Themes',
        type: 'knowledge',
        timestamp: new Date().toISOString(),
        category: 'app-philosophy'
      }
    },
    {
      id: 'tryit-ai-blues-video',
      content: `Music Video Details: "TryIt A.I. Blues"

The music video is displayed on the landing page of the Noah app. It features:
- A dragonfly made of computer electronic parts
- Black background
- Lyrics superimposed over the image

The dragonfly imagery symbolizes transformation and adaptability - a natural creature reimagined with technological elements, representing the fusion of human nature with helpful technology.

The video is on the landing page because it's fun, it's about TryIt AI, and it helps explain why creator Isak Griffiths built this app and what she hopes it means to people.`,
      metadata: {
        source: 'TryIt A.I. Blues - Video',
        type: 'knowledge',
        timestamp: new Date().toISOString(),
        category: 'landing-page'
      }
    }
  ];

  try {
    await vectorStore.addDocuments(documents);
    console.log('✅ Successfully added song knowledge to vector store!');
    console.log(`📊 Added ${documents.length} document chunks`);
    
    // Verify by getting stats
    const stats = await vectorStore.getStats();
    console.log(`📈 Total documents in collection: ${stats.count}`);
    
  } catch (error) {
    console.error('❌ Failed to add song knowledge:', error);
    throw error;
  }
}

// Run the script
addSongKnowledge()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
