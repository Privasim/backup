/**
 * Ensures the streamed markdown contains exactly three phases.
 * If missing, appends minimal placeholder-compliant sections using TBD, which is allowed by the prompt.
 */
export function ensureThreePhases(content: string): { content: string; foundPhases: string[]; repaired: boolean } {
  const text = content || '';
  const lines = text.split('\n');

  const phaseTitleRegexH2 = /^##\s*Phase\s+([1-3])\s*[-:]\s*(.+)$/i;
  const phaseTitleRegexPlain = /^Phase\s+([1-3])\s*[-:]\s*(.+)$/i;

  const titles: string[] = [];
  for (const line of lines) {
    const h2 = line.match(phaseTitleRegexH2);
    if (h2) {
      titles.push(`Phase ${h2[1]} - ${h2[2].trim()}`);
      continue;
    }
    const pl = line.match(phaseTitleRegexPlain);
    if (pl) {
      titles.push(`Phase ${pl[1]} - ${pl[2].trim()}`);
    }
  }

  const uniquePhases = Array.from(new Set(titles.map(t => t.replace(':', ' -'))));

  const hasP1 = uniquePhases.some(t => t.startsWith('Phase 1 -'));
  const hasP2 = uniquePhases.some(t => t.startsWith('Phase 2 -'));
  const hasP3 = uniquePhases.some(t => t.startsWith('Phase 3 -'));

  if (hasP1 && hasP2 && hasP3) {
    return { content: text, foundPhases: uniquePhases, repaired: false };
  }

  // Build minimal placeholders respecting the system prompt timelines and data integrity rules
  let repairedContent = text.trim();

  const appendPhase = (n: 1 | 2 | 3) => {
    const name = n === 1 ? 'Building' : n === 2 ? 'Marketing' : 'Feedback and Iteration';
    const timeline = n === 1 ? '7-14 days' : n === 2 ? '14-30 days' : '30-60 days';
    const channels = n === 1 ? 'N/A' : 'TBD';
    const block = [
      '',
      `## Phase ${n} - ${name}`,
      `Timeline: ${timeline}`,
      `Tools: TBD`,
      `Channels: ${channels}`,
      `Description: TBD — fill in per system prompt requirements.`,
      ''
    ].join('\n');
    repairedContent += `\n${block}`;
  };

  if (!hasP1) appendPhase(1);
  if (!hasP2) appendPhase(2);
  if (!hasP3) appendPhase(3);

  return { content: repairedContent, foundPhases: uniquePhases, repaired: true };
}
