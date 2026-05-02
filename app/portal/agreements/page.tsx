'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/lib/firebase'
import { CLOUD_FUNCTIONS } from '@/lib/functions-config'

interface AgreementRow {
  id: string
  documentVersion: string
  programTrack: string
  signedAt: string
  pdfStoragePath: string
}

export default function PortalAgreementsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<AgreementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const q = query(
      collection(db, "enrollmentAgreements"),
      where("uid", "==", user.uid),
      orderBy("signedAt", "desc")
    )
    getDocs(q)
      .then((snap) => {
        const out: AgreementRow[] = []
        snap.forEach((d) => {
          const data = d.data() as Record<string, unknown>
          out.push({
            id: d.id,
            documentVersion: (data.documentVersion as string) || "",
            programTrack: (data.programTrack as string) || "",
            signedAt: (data.signedAt as string) || "",
            pdfStoragePath: (data.pdfStoragePath as string) || "",
          })
        })
        setRows(out)
      })
      .catch((err) => {
        console.error(err)
        setError(err instanceof Error ? err.message : "Failed to load agreements")
      })
      .finally(() => setLoading(false))
  }, [user])

  async function download(id: string) {
    setDownloading(id)
    setError("")
    try {
      const auth = getAuth()
      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) throw new Error("Not signed in")
      const url = CLOUD_FUNCTIONS.getSignedAgreementPdf + "?enrollmentId=" + encodeURIComponent(id)
      const res = await fetch(url, { headers: { Authorization: "Bearer " + idToken } })
      const data = await res.json()
      if (!res.ok || !data.ok || !data.url) throw new Error(data.error || "Failed")
      window.open(data.url, "_blank", "noopener")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed")
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest mb-2">Signed agreements</h1>
      <p className="text-text-muted text-sm mb-6">
        Your enrollment agreements are listed here. Click "Download PDF" for a fresh, time-limited
        signed link. ESIGN gives you the right to a paper copy on request — email
        hello@iepandthrive.com if you prefer mail.
      </p>
      {loading && <p className="text-text-muted">Loading...</p>}
      {error && <p className="text-red-700 mb-3">{error}</p>}
      {!loading && rows.length === 0 && (
        <p className="text-text-muted">No signed agreements yet.</p>
      )}
      {!loading && rows.length > 0 && (
        <div className="divide-y divide-border bg-white rounded-2xl border border-border">
          {rows.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-text">Enrollment Agreement v{r.documentVersion}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Program: {r.programTrack || "—"} · Signed {r.signedAt ? new Date(r.signedAt).toLocaleString() : "unknown date"}
                </p>
              </div>
              <button
                onClick={() => download(r.id)}
                disabled={downloading === r.id}
                className="shrink-0 text-xs font-semibold text-white bg-forest px-3 py-2 rounded-full hover:bg-forest-mid disabled:opacity-60"
              >
                {downloading === r.id ? "Loading..." : "Download PDF"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
