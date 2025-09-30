import Link from 'next/link';

export default function UIDemosIndex() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Noah UI Concepts</h1>
        <p className="text-slate-600 mb-8">Click any option below to preview the UI direction</p>
        
        <div className="grid gap-6">
          <Link href="/ui-demos/ethereal-canvas" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500">
            <h2 className="text-xl font-semibold mb-2">1. Ethereal Canvas (Beautiful & Approachable)</h2>
            <p className="text-slate-600">Soft gradients, gentle aesthetics, trust garden visualization</p>
          </Link>
          
          <Link href="/ui-demos/data-observatory" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500">
            <h2 className="text-xl font-semibold mb-2">2. Data Observatory (Analytical & Transparent)</h2>
            <p className="text-slate-600">Dashboard-style with metrics, charts, and data visualization</p>
          </Link>
          
          <Link href="/ui-demos/command-center" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500">
            <h2 className="text-xl font-semibold mb-2">3. Command Center (Power User)</h2>
            <p className="text-slate-600">Terminal-like dark theme, technical and efficient</p>
          </Link>
          
          <Link href="/ui-demos/cognitive-blueprint" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-indigo-500">
            <h2 className="text-xl font-semibold mb-2">4. Cognitive Blueprint Lab (Enterprise Transparency)</h2>
            <p className="text-slate-600">Audit trails, compliance dashboards, explainable AI with evidence chains</p>
          </Link>
          
          <Link href="/ui-demos/adaptive-narrative" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-500">
            <h2 className="text-xl font-semibold mb-2">5. Adaptive Narrative Studio (Story-Driven)</h2>
            <p className="text-slate-600">Branching conversations, persona modes, interactive storytelling interface</p>
          </Link>
        </div>
        
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Noah</Link>
        </div>
      </div>
    </div>
  );
}
