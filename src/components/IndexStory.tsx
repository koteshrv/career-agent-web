import type * as React from 'react';

/** How the job index is built: shown on the Companies page and on About. Facts here must match the crawler. */
export function IndexStory({ headingId = 'how-built', lead = 'Every hour, for every employer above:' }: { headingId?: string; lead?: React.ReactNode }) {
  return (
    <>
      <h2 id={headingId} className="text-lg font-medium text-foreground">How this index is built</h2>
      <p className="mt-1 text-sm text-muted-foreground">{lead}</p>
      <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
        {[
          ['List every open role', 'straight from the employer\u2019s own applicant system (Greenhouse, Lever, Ashby, Workday and more), never from job boards. The largest boards are read every four hours.'],
          ['Fetch every description', 'in full, from each role\u2019s own page, not the snippet a listing shows.'],
          ['Read each one with AI', 'cleaning the text and extracting seniority, years of experience, stack, skills, salary, workplace and visa details: the fields you filter, scan and evaluate on. Each posting is fingerprinted, so the same role seen twice is stored once.'],
        ].map(([title, body], i) => (
          <li key={title} className="flex gap-3">
            <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong text-xs tabular-nums text-foreground">{i + 1}</span>
            <span><span className="text-foreground">{title}</span> {body}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted-foreground">
        <span className="text-foreground">Kept current.</span> A role missing from its board for a day, across at least two runs, is closed, and three separate
        reports hide a posting until someone checks it. All of it is free and needs no account: the crawling, the AI reading and the API are paid for by the project, not by your data.
      </p>
    </>
  );
}
