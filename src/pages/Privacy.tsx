import { Page, PageHeader } from '../components/ui/page';
import { Link } from 'react-router-dom';

const a = 'text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground';

export function Privacy() {
  return (
    <Page>
      <PageHeader
        title="Privacy Policy"
        description="Transparency about your data and how we handle it."
      />
      <section className="mt-6 text-sm text-muted-foreground space-y-4">
        <h2 className="text-lg font-medium text-foreground">What Data We Collect (Transparency)</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Anonymous Search Analytics:</strong> We log basic search queries and timestamps to improve the service. No personal identity is attached.
          </li>
          <li>
            <strong className="text-foreground">Voluntary Application Outcomes:</strong> If enabled in <Link to="/settings#data" className={a}>Settings</Link>, response times by company are shared anonymously to help the community.
          </li>
          <li>
            <strong className="text-foreground">No Local Data Collection:</strong> Your resume, AI keys, drafted cover letters, and tracked applications never leave your browser extension or local storage.
          </li>
          <li>
            <strong className="text-foreground">No Third-Party Tracking:</strong> We do not use Google Analytics, Meta Pixels, or other tracking scripts.
          </li>
        </ul>
      </section>
    </Page>
  );
}
