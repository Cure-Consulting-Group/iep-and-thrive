import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// ─── Types ───

export interface AvailableSlot {
  id: string
  date: string          // "2026-07-15"
  startTime: string     // "10:00"
  endTime: string       // "10:20"
  duration: number      // 20
  type: 'discovery_call' | 'consultation' | 'check_in'
  isAvailable: boolean
  bookedBy: string | null
  createdAt: Timestamp
}

export interface Booking {
  id: string
  parentId: string
  parentName: string
  parentEmail: string
  studentName: string
  type: 'discovery_call' | 'consultation' | 'check_in'
  slotId: string
  date: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  googleCalendarEventId: string
  notes: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Slot Operations ───

const slotsRef = collection(db, 'availableSlots')

export async function createSlot(slot: Omit<AvailableSlot, 'id' | 'createdAt'>) {
  return addDoc(slotsRef, {
    ...slot,
    createdAt: serverTimestamp(),
  })
}

export async function createBulkSlots(
  dates: string[],
  startHour: number,
  endHour: number,
  durationMinutes: number,
  type: AvailableSlot['type']
) {
  const batch = writeBatch(db)
  const slots: Array<Omit<AvailableSlot, 'id' | 'createdAt'>> = []

  for (const date of dates) {
    let currentMinutes = startHour * 60
    const endMinutes = endHour * 60

    while (currentMinutes + durationMinutes <= endMinutes) {
      const startH = Math.floor(currentMinutes / 60)
      const startM = currentMinutes % 60
      const endTotal = currentMinutes + durationMinutes
      const endH = Math.floor(endTotal / 60)
      const endM = endTotal % 60

      const slotData = {
        date,
        startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
        endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
        duration: durationMinutes,
        type,
        isAvailable: true,
        bookedBy: null,
      }

      const docRef = doc(slotsRef)
      batch.set(docRef, { ...slotData, createdAt: serverTimestamp() })
      slots.push(slotData)
      currentMinutes += durationMinutes
    }
  }

  await batch.commit()
  return slots.length
}

export async function getSlotsByDate(date: string): Promise<AvailableSlot[]> {
  const q = query(slotsRef, where('date', '==', date), orderBy('startTime', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AvailableSlot))
}

export async function getAvailableSlots(startDate: string, endDate: string): Promise<AvailableSlot[]> {
  const q = query(
    slotsRef,
    where('isAvailable', '==', true),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc'),
    orderBy('startTime', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AvailableSlot))
}

export async function deleteSlot(slotId: string) {
  return deleteDoc(doc(db, 'availableSlots', slotId))
}

export async function toggleSlotAvailability(slotId: string, isAvailable: boolean) {
  return updateDoc(doc(db, 'availableSlots', slotId), { isAvailable })
}

// ─── Booking Operations ───

const bookingsRef = collection(db, 'bookings')

export async function createBooking(
  booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'googleCalendarEventId' | 'status'>
) {
  // Mark slot as booked
  await updateDoc(doc(db, 'availableSlots', booking.slotId), {
    isAvailable: false,
    bookedBy: booking.parentId,
  })

  // Create booking doc
  return addDoc(bookingsRef, {
    ...booking,
    status: 'confirmed',
    googleCalendarEventId: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getBookingsByParent(parentId: string): Promise<Booking[]> {
  const q = query(bookingsRef, where('parentId', '==', parentId), orderBy('date', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking))
}

export async function getAllBookings(): Promise<Booking[]> {
  const q = query(bookingsRef, orderBy('date', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking))
}

export async function updateBookingStatus(bookingId: string, status: Booking['status']) {
  return updateDoc(doc(db, 'bookings', bookingId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function cancelBooking(bookingId: string, slotId: string) {
  // Restore slot
  await updateDoc(doc(db, 'availableSlots', slotId), {
    isAvailable: true,
    bookedBy: null,
  })
  // Cancel booking
  return updateDoc(doc(db, 'bookings', bookingId), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  })
}
