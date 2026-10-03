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
              <li><strong>Job Discovery:</strong> When you browse job boards, we extract the raw job description (stripping all tracking links and profiles) to add to the global search index.</li>
              <li><strong>Company Outcomes:</strong> When you update a job's status to Interviewing or Rejected, we use that to calculate public "Ghost Scores" and company response times.</li>
              <li><strong>AI Accuracy:</strong> Simple success counts (e.g., "12/15 fields autofilled") to help us improve the AI models.</li>
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
        <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground">Built by Hari.</span>{' '}
            <a className={a} href="https://www.linkedin.com/in/koteshrv" target="_blank" rel="noreferrer">LinkedIn</a> &middot;{' '}
            <a className={a} href="https://github.com/koteshrv" target="_blank" rel="noreferrer">GitHub</a>
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
