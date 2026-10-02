/**
 * Content diff for resumes: LaTeX or Markdown on either side is reduced to plain lines first, so the diff shows what
 * the draft changed in substance (bullets, summary, ordering) rather than markup. Line LCS; resumes are short.
 */
export type DiffLine = { kind: 'same' | 'added' | 'removed'; text: string };

export function toContentLines(src: string): string[] {
  let s = src;
  const start = s.indexOf('\\begin{document}');
  if (start !== -1) s = s.slice(start + '\\begin{document}'.length, s.lastIndexOf('\\end{document}') === -1 ? undefined : s.lastIndexOf('\\end{document}'));
  s = s.replace(/(^|[^\\])%.*$/gm, '$1'); // LaTeX comments
  // Structural macros become their own lines so headings and roles stay visible.
  s = s.replace(/\\(resumeSubheading|resumesubheading|resumeProjectHeading)\s*\{/g, '\n\\$1{').replace(/\\(resumeItem|resumeitem|item|section)\b/g, '\n\\$1');
  s = s
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, '$1')
    .replace(/\\[A-Za-z@]+\*?(\[[^\]]*\])?/g, ' ') // commands
    .replace(/[{}]/g, ' ')
    .replace(/\$\|\$/g, '|')
    .replace(/[#*_]{1,2}/g, '') // markdown emphasis and headings
    .replace(/\\\\/g, '\n')
    .replace(/\\([&%$#_])/g, '$1');
  return s
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').replace(/^[\s\-•]+/, '').trim())
    .filter((l) => l.length > 1);
}

export function diffLines(a: string[], b: string[]): DiffLine[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ kind: 'same', text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ kind: 'removed', text: a[i++] });
    else out.push({ kind: 'added', text: b[j++] });
  }
  while (i < n) out.push({ kind: 'removed', text: a[i++] });
  while (j < m) out.push({ kind: 'added', text: b[j++] });
  return out;
}

export function diffResumes(base: string, draft: string): DiffLine[] {
  return diffLines(toContentLines(base), toContentLines(draft));
}
