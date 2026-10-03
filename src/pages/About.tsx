import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { version as APP_VERSION } from '../../package.json';
import { Page, PageHeader } from '../components/ui/page';
import { IndexStory } from '../components/IndexStory';

const DISCORD_URL = import.meta.env.VITE_DISCORD_URL || '';
const a = 'text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground';

/** Who builds CareerAgent, what happens to your data, and how the index is made. */
export function About() {
  const { hash } = useLocation();
  // Deep links such as /about#privacy land on the section once it has rendered.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  return (
    <Page>
      <PageHeader
        title="About CareerAgent"
        description="Find open roles straight from employers’ own career sites, see how well each one fits you, and apply with a resume written for that job. Free, open source, and no account: your data and AI key stay on your device."
      />

            <section id="privacy" aria-labelledby="privacy-title" className="scroll-mt-6">
        <h2 id="privacy-title" className="text-lg font-medium text-foreground">How your data is handled</h2>
        <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground">It stays on your device.</span> Your profile, pipeline, resumes, drafts and evaluations live in this browser and in the
            extension’s storage. You can export all of it, or delete it, from <Link to="/settings#data" className={a}>Settings</Link>.
          </li>
          <li>
            <span className="text-foreground">Your AI key never reaches us.</span> It is stored only in the extension, and every AI request goes from the extension
            straight to the provider you chose: Gemini, OpenAI, Anthropic or Groq. The exact prompts are listed in your{' '}
            <Link to="/settings/activity" className={a}>AI activity log</Link>.
          </li>
          <li>
            <span className="text-foreground">What our server sees (The Transparent Data Engine).</span> We collect absolutely zero personally identifiable information (PII). The extension only shares three types of anonymous data to power the open-source community:
            <ul className="mt-2 list-inside list-disc space-y-1 pl-2 text-muted-foreground">
              <li><strong>Job Discovery:</strong> When you browse supported job boards (currently LinkedIn, Naukri, and Indeed), we extract the raw job description (stripping all tracking links and profiles) to add to the global search index. You can verify this sanitization in our <a className={a} href="https://github.com/koteshrv/career-agent-extension" target="_blank" rel="noreferrer">open-source extension code</a>.</li>
              <li><strong>Company Outcomes:</strong> When you update a job's status to Interviewing or Rejected, we use that to calculate public "Ghost Scores" and company response times.</li>
              <li><strong>Autofill Reliability:</strong> Simple success counts (e.g., "12/15 fields autofilled") to help us fix broken selectors and maintain our job board configurations.</li>
            </ul>
          </li>
          <li>
            <span className="text-foreground">Dead Link Detection.</span> If you click a job and the page returns a 404 or "Position Closed", the extension pings the server to hide it from the search index for everyone else.
          </li>
          <li>
            <span className="text-foreground">No tracking.</span> No analytics or advertising scripts, and company logos are served from this site rather than a third party.
          </li>
        </ul>
      </section>

      <section aria-labelledby="index-title" className="mt-10">
        <IndexStory
          headingId="index-title"
          lead={
            <>
              Every hour, for every <Link to="/portals" className={a}>employer we index</Link>:
            </>
          }
        />
      </section>

      <section aria-labelledby="people-title" className="mt-10">
        <h2 id="people-title" className="text-lg font-medium text-foreground">Open source and contact</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-4 flex-wrap">
            <span className="text-foreground">Built by Hari.</span>
            <a className="inline-flex items-center gap-1.5 text-[#0A66C2] hover:text-[#004182] transition-colors font-medium" href="https://www.linkedin.com/in/koteshrv" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              <span>LinkedIn</span>
            </a>
            <a className="inline-flex items-center gap-1.5 text-foreground hover:text-foreground/70 transition-colors font-medium" href="https://github.com/koteshrv" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 16 16" fill="currentColor" className="size-4"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" /></svg>
              <span>GitHub</span>
            </a>
            <a className="inline-flex items-center gap-1.5 text-[#5865F2] hover:text-[#4752C4] transition-colors font-medium" href="https://discord.gg/ckafJ5wTKK" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.01.02.04.03.08.02c1.71-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/></svg>
              <span>Discord Community</span>
            </a>
          </li>
          <li>
            <span className="text-foreground">Open source.</span> The{' '}
            <a className={a} href="https://github.com/koteshrv/career-agent-web" target="_blank" rel="noreferrer">dashboard</a> and the{' '}
            <a className={a} href="https://github.com/koteshrv/career-agent-extension" target="_blank" rel="noreferrer">extension</a> are on GitHub under the MIT license.
          </li>
          <li>
            <span className="text-foreground">Feedback and bugs.</span>{' '}
            <a className={a} href="https://github.com/koteshrv/career-agent-web/issues" target="_blank" rel="noreferrer">Open an issue</a>
            {DISCORD_URL && (
              <>
                {' '}or say hi in{' '}
                <a className={a} href={DISCORD_URL} target="_blank" rel="noreferrer">Discord</a>
              </>
            )}
            .
          </li>
        </ul>
        <p className="mt-4 text-xs tabular-nums text-muted-foreground">Dashboard {APP_VERSION}</p>
      </section>
    </Page>
  );
}
