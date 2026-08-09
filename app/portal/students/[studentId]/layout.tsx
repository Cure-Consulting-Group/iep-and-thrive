// Server layout whose only job is to satisfy `output: 'export'` for this
// dynamic segment: static export requires generateStaticParams on a server
// file, but the pages below are client components resolving studentId at
// runtime via useParams. We export one placeholder path; real deep links are
// served by the SPA rewrite ("**" -> /index.html) in firebase.json.
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
