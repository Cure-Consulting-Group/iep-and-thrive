import AssessmentStudentClient from "./AssessmentStudentClient"

// Static export requires generateStaticParams. Student IDs aren't known at
// build time, so the canonical client route is
// /admin/assessments/student?studentId=…  (see ../student/page.tsx).
// This dynamic route stub is kept to avoid breaking any hardcoded links;
// it generates no static pages.
// Returns a placeholder param to satisfy `output: 'export'`; the
// real entry point is /admin/assessments/student?studentId=…
export function generateStaticParams() {
  return [{ studentId: "_" }]
}

export default function AssessmentStudentPage({
  params,
}: {
  params: { studentId: string }
}) {
  return <AssessmentStudentClient studentId={params.studentId} />
}
