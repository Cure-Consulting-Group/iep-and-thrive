// Server layout whose only job is to satisfy `output: 'export'` for this
// dynamic segment: static export requires generateStaticParams on a server
// file, but the pages below are client components resolving studentId at
// runtime via useParams. We export one placeholder path; real deep links are
// served by the scoped "/portal/students/**" rewrite in firebase.json. That
// rewrite is deliberately scoped rather than "**": a catch-all also swallowed
// unknown URLs and served the marketing homepage instead of 404.html.
// Adding a new dynamic route means adding its prefix there too.
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
