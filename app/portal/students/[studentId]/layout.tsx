// Server layout whose only job is to satisfy `output: 'export'` for this
// dynamic segment: static export requires generateStaticParams on a server
// file, but the pages below are client components resolving studentId at
// runtime via useParams. We export one placeholder path; real deep links are
// routed by the scoped "/portal/students/**" rewrite in firebase.json, which
// replaced a catch-all "**" that also swallowed unknown URLs and served the
// marketing homepage instead of 404.html. Adding a new dynamic route means
// adding its prefix there too.
//
// KNOWN BROKEN (verified against production 2026-09-06): the rewrite sends
// these paths to /index.html, and under `output: 'export'` that file is the
// marketing homepage, not an app shell. A request for
// /portal/students/<real-id>/sessions returns the homepage byte-for-byte; only
// the exported "_" placeholder serves the real page. TASK-LP-035's first
// acceptance criterion is NOT met. Fixing it needs either query-based learner
// routes or the hosting-strategy migration the ticket calls out, both of which
// need a working build to verify.
export function generateStaticParams() {
  return [{ studentId: '_' }]
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
