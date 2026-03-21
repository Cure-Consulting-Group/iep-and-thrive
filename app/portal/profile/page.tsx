'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { db, storage, auth } from '@/lib/firebase'

export default function PortalProfilePage() {
  const { profile, user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // Editable fields
  const [displayName, setDisplayName] = useState(profile?.displayName || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [emailNotifications, setEmailNotifications] = useState(true)

  // Student form
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [studentDob, setStudentDob] = useState('')
  const [studentGrade, setStudentGrade] = useState('')
  const [studentDistrict, setStudentDistrict] = useState('')
  const [studentProgram, setStudentProgram] = useState('reading')
  const [studentMedical, setStudentMedical] = useState('')
  const [ec1Name, setEc1Name] = useState('')
  const [ec1Phone, setEc1Phone] = useState('')
  const [ec1Rel, setEc1Rel] = useState('')
  const [ec2Name, setEc2Name] = useState('')
  const [ec2Phone, setEc2Phone] = useState('')
  const [ec2Rel, setEc2Rel] = useState('')
  const [iepFile, setIepFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [savingStudent, setSavingStudent] = useState(false)

  // Password change
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        phone,
        emailNotifications,
        updatedAt: serverTimestamp(),
      })
      setEditing(false)
    } catch (err) {
      console.error('Failed to save profile:', err)
      alert('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSavingStudent(true)

    try {
      let iepDocumentUrl = ''
      if (iepFile) {
        const storagePath = `iep-documents/${user.uid}/${Date.now()}_${iepFile.name}`
        const storageRef = ref(storage, storagePath)
        const upload = uploadBytesResumable(storageRef, iepFile)
        await new Promise<void>((resolve, reject) => {
          upload.on('state_changed', null, reject, async () => {
            iepDocumentUrl = await getDownloadURL(upload.snapshot.ref)
            resolve()
          })
        })
      }

      const { addDoc, collection } = await import('firebase/firestore')
      await addDoc(collection(db, 'users', user.uid, 'students'), {
        name: studentName,
        dateOfBirth: studentDob,
        grade: studentGrade,
        district: studentDistrict,
        programTrack: studentProgram,
        enrollmentStatus: 'inquiry',
        medicalNotes: studentMedical,
        iepDocumentUrl,
        emergencyContacts: [
          { name: ec1Name, phone: ec1Phone, relationship: ec1Rel },
          { name: ec2Name, phone: ec2Phone, relationship: ec2Rel },
        ].filter((ec) => ec.name && ec.phone),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Reset form
      setStudentName(''); setStudentDob(''); setStudentGrade('')
      setStudentDistrict(''); setStudentProgram('reading'); setStudentMedical('')
      setEc1Name(''); setEc1Phone(''); setEc1Rel('')
      setEc2Name(''); setEc2Phone(''); setEc2Rel('')
      setIepFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setShowStudentForm(false)
      alert('Student added successfully!')
    } catch (err) {
      console.error('Failed to add student:', err)
      alert('Failed to add student. Please try again.')
    }
    setSavingStudent(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !user.email) return
    setPwError('')
    setPwSuccess(false)

    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw)
      await reauthenticateWithCredential(user, cred)
      await updatePassword(user, newPw)
      setPwSuccess(true)
      setCurrentPw('')
      setNewPw('')
      setChangingPassword(false)
    } catch (err: unknown) {
      const error = err as { code?: string }
      if (error.code === 'auth/wrong-password') {
        setPwError('Current password is incorrect.')
      } else if (error.code === 'auth/weak-password') {
        setPwError('New password must be at least 6 characters.')
      } else {
        setPwError('Failed to change password.')
      }
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest mb-2">My Profile</h1>
      <p className="text-text-muted font-body text-sm mb-8">
        Manage your account and student information.
      </p>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-forest">Account Information</h2>
          <button
            onClick={() => { editing ? handleSaveProfile() : setEditing(true) }}
            disabled={saving}
            className="text-sm font-body font-semibold text-forest hover:text-forest/70"
          >
            {saving ? 'Saving...' : editing ? '💾 Save' : '✏️ Edit'}
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm font-body text-text-muted">Name</span>
            {editing ? (
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="form-input w-56 text-sm" />
            ) : (
              <span className="text-sm font-body font-semibold text-text">{profile?.displayName || '—'}</span>
            )}
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm font-body text-text-muted">Email</span>
            <span className="text-sm font-body text-text">{user?.email || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm font-body text-text-muted">Phone</span>
            {editing ? (
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input w-56 text-sm" placeholder="(555) 123-4567" />
            ) : (
              <span className="text-sm font-body text-text">{profile?.phone || '—'}</span>
            )}
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm font-body text-text-muted">Role</span>
            <span className="text-sm font-body bg-sage/20 text-forest px-2.5 py-0.5 rounded-full font-semibold capitalize">
              {profile?.role || 'Parent'}
            </span>
          </div>
          {editing && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-body text-text-muted">Email Notifications</span>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${emailNotifications ? 'bg-forest' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-forest">Security</h2>
          <button
            onClick={() => setChangingPassword(!changingPassword)}
            className="text-sm font-body font-semibold text-forest hover:text-forest/70"
          >
            {changingPassword ? 'Cancel' : '🔒 Change Password'}
          </button>
        </div>
        {pwSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm font-body">
            ✅ Password changed successfully!
          </div>
        )}
        {changingPassword && (
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Current password"
              required
              className="form-input"
            />
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="New password (min 6 chars)"
              required
              minLength={6}
              className="form-input"
            />
            {pwError && <p className="text-xs text-red-500 font-body">{pwError}</p>}
            <button type="submit" className="bg-forest text-white font-body text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-forest/90 transition-colors">
              Update Password
            </button>
          </form>
        )}
      </div>

      {/* Add Student */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-forest">My Students</h2>
          <button
            onClick={() => setShowStudentForm(!showStudentForm)}
            className="bg-forest text-white font-body text-sm font-semibold px-4 py-2 rounded-xl hover:bg-forest/90 transition-colors"
          >
            {showStudentForm ? 'Cancel' : '+ Add Student'}
          </button>
        </div>

        {showStudentForm && (
          <form onSubmit={handleAddStudent} className="border border-border rounded-xl p-5 mb-4">
            <h3 className="font-body font-semibold text-text mb-3">Student Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-body font-semibold text-text-muted mb-1">Full Name *</label>
                <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-body font-semibold text-text-muted mb-1">Date of Birth *</label>
                <input type="date" value={studentDob} onChange={(e) => setStudentDob(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-body font-semibold text-text-muted mb-1">Grade *</label>
                <select value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} required className="form-input">
                  <option value="">Select...</option>
                  {['K', '1', '2', '3', '4', '5', '6', '7', '8'].map((g) => (
                    <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-body font-semibold text-text-muted mb-1">School District *</label>
                <input type="text" value={studentDistrict} onChange={(e) => setStudentDistrict(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-body font-semibold text-text-muted mb-1">Program Track *</label>
                <select value={studentProgram} onChange={(e) => setStudentProgram(e.target.value)} className="form-input">
                  <option value="reading">Reading & Language</option>
                  <option value="math">Math & Numeracy</option>
                  <option value="full">Full Academic</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-body font-semibold text-text-muted mb-1">IEP/504 Document (PDF)</label>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => setIepFile(e.target.files?.[0] || null)} className="form-input" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-body font-semibold text-text-muted mb-1">Medical Notes</label>
              <textarea value={studentMedical} onChange={(e) => setStudentMedical(e.target.value)} className="form-input" rows={2} placeholder="Allergies, medications, etc." />
            </div>
            <h3 className="font-body font-semibold text-text mb-3">Emergency Contacts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input type="text" value={ec1Name} onChange={(e) => setEc1Name(e.target.value)} placeholder="Contact 1 Name *" required className="form-input" />
              <input type="tel" value={ec1Phone} onChange={(e) => setEc1Phone(e.target.value)} placeholder="Phone *" required className="form-input" />
              <input type="text" value={ec1Rel} onChange={(e) => setEc1Rel(e.target.value)} placeholder="Relationship" className="form-input" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input type="text" value={ec2Name} onChange={(e) => setEc2Name(e.target.value)} placeholder="Contact 2 Name" className="form-input" />
              <input type="tel" value={ec2Phone} onChange={(e) => setEc2Phone(e.target.value)} placeholder="Phone" className="form-input" />
              <input type="text" value={ec2Rel} onChange={(e) => setEc2Rel(e.target.value)} placeholder="Relationship" className="form-input" />
            </div>
            <button
              type="submit"
              disabled={savingStudent}
              className="bg-forest text-white font-body text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-forest/90 disabled:opacity-50 transition-colors"
            >
              {savingStudent ? 'Saving...' : 'Add Student'}
            </button>
          </form>
        )}

        <p className="text-sm text-text-muted font-body">
          Students you add will be visible to the program admin for enrollment processing.
        </p>
      </div>
    </div>
  )
}
