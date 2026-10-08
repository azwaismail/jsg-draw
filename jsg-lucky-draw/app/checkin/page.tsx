'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CheckInPage() {
  const [staffId, setStaffId] = useState('')
  const [staffDOB, setdob] = useState('')
  const [message, setMessage] = useState('')
  const [staff, setStaff] = useState<any>(null)
  const [verified, setVerified] = useState(false)
  const [luckyCode, setLuckyCode] = useState('')
  const [attendanceOpen, setAttendanceOpen] = useState(true)

  useEffect(() => {
  loadEventControl()

  const interval = setInterval(() => {
    loadEventControl()
  }, 3000)

  return () => clearInterval(interval)
  }, [])

    async function loadEventControl() {
        const { data, error } = await supabase
            .from('event_control')
            .select('*')
            .eq('id', 1)
            .single()

        if (error) {
          setMessage('Unable to load event settings')
          return
        }

        setAttendanceOpen(data.attendance_open)
    }  

  async function verifyStaff() {
    if (!attendanceOpen) {
        setMessage('Attendance check-in has closed')
        return
    }

    setMessage('Verifying...')

    const { data, error } = await supabase
      .from('staff_master')
      .select('*')
      .eq('staff_id', staffId.trim())
      .eq('dob', staffDOB.trim())
      .single()

    if (error || !data) {
      setMessage('Invalid Staff ID or Date of Birth')
      return
    }

    setStaff(data)
    setVerified(true)
    setLuckyCode('')

    setMessage(
      `Welcome ${data.full_name}`
    )
  }

  function generateLuckyCode() {
    const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    let code = ""

    for (let i = 0; i < 6; i++) {
        code += chars.charAt(
            Math.floor(Math.random() * chars.length)
        )
    }
    return code
  }

  async function confirmAttendance() {
    const { data: control } =
  await supabase
    .from('event_control')
    .select('attendance_open')
    .eq('id', 1)
    .single()

  if (!control?.attendance_open) {

  setMessage(
    'Attendance check-in has closed'
  )
  return
  }

  const { data: existing} = await supabase
    .from('attendance')
    .select('*')
    .eq('staff_id', staff.staff_id)
    .maybeSingle()

  if (existing) {

    setMessage(`Already checked in.`)
    setLuckyCode(existing.attendance_lucky_no)
    setVerified(false)

    return
  }

  const luckyCode = generateLuckyCode()

  const { error } = await supabase
    .from('attendance')
    .insert([
      {
        staff_id: staff.staff_id,
        checked_in: true,
        attendance_lucky_no: luckyCode,
        event_year: 2026,
        bonus_draw_eligible: true,
        draw_revealed: false
      }
    ])

  if (error) {
    setMessage(error.message)
    return
  }

  setMessage(`✅ Attendance Confirmed.`)
  setLuckyCode(luckyCode)
  setVerified(false)
}

if (!attendanceOpen) {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="text-center">

            <h1 className="text-4xl font-bold text-red-600 mb-4">
                Attendance Closed
            </h1>
            
            <p className="text-lg">
                Attendance check-in has closed.
            </p>

            <p className="text-gray-500 mt-2">
                Please contact the organizer.
            </p>
        </div>
        </main>
        )
    }

    return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        ONE1JSG Annual Dinner 2026
      </h1>

      <h2 className="text-xl mb-4">
        Attendance Check-In
      </h2>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Staff ID"
        value={staffId}
        onChange={(e) => setStaffId(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Date of Birth (ddmmyyyy)"
        value={staffDOB}
        onChange={(e) => setdob(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={verifyStaff}
      >
        Verify
      </button>

      <p className="mt-4">{message}</p>

      {
        verified && (
            <button
                className="bg-green-600 text-white px-4 py-2 rounded mt-4"
                onClick={confirmAttendance}
            >
                Confirm Attendance
            </button>
        )
      }

      {luckyCode && (
        <div className="mt-8 text-center">
            <p className="text-gray-600 text-lg">
                Your Lucky Draw Code
            </p>
            <div className="text-5xl font-bold text-green-600 mt-2">
                {luckyCode}
            </div>
        </div>
        )
        }
    </main>
  )
}