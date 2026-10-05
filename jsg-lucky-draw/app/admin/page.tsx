'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {

  const [message, setMessage] = useState('')

  const [attendanceOpen, setAttendanceOpen] =
    useState(false)

  const [drawLobbyOpen, setDrawLobbyOpen] =
    useState(false)

  const [totalStaff, setTotalStaff] =
    useState(0)

  const [checkedInCount, setCheckedInCount] =
    useState(0)

  const [drawnCount, setDrawnCount] =
    useState(0)

  const [remainingToDraw, setRemainingToDraw] =
    useState(0)

  const [remainingPrizes, setRemainingPrizes] =
    useState(0)

  const [claimedCount, setClaimedCount] =
  useState(0)

  const [unclaimedCount, setUnclaimedCount] =
  useState(0)

  useEffect(() => {
    loadDashboard()

    const interval = setInterval(() => {
      loadDashboard()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  async function loadDashboard() {

    const { data: control } = await supabase
      .from('event_control')
      .select('*')
      .eq('id', 1)
      .single()

    if (control) {
      setAttendanceOpen(control.attendance_open)
      setDrawLobbyOpen(control.draw_lobby_open)
    }

    const { count: totalStaffCount } =
      await supabase
        .from('staff_master')
        .select('*', {
          count: 'exact',
          head: true
        })

    setTotalStaff(totalStaffCount || 0)

    const { count: attendanceCount } =
      await supabase
        .from('attendance')
        .select('*', {
          count: 'exact',
          head: true
        })

    setCheckedInCount(attendanceCount || 0)

    const { count: drawn } =
      await supabase
        .from('attendance')
        .select('*', {
          count: 'exact',
          head: true
        })
        .not('prize_code', 'is', null)

    setDrawnCount(drawn || 0)

    setRemainingToDraw(
      (attendanceCount || 0) -
      (drawn || 0)
    )

    const { count: remaining } =
      await supabase
        .from('prizes')
        .select('*', {
          count: 'exact',
          head: true
        })
        .is('winner_staff_id', null)

    setRemainingPrizes(remaining || 0)

    const { count: claimed } =
        await supabase
            .from('prizes')
            .select('*', {
                count: 'exact',
                head: true
            })
        .eq('claimed', true)

    setClaimedCount(claimed || 0)

    const { count: unclaimed } =
        await supabase
            .from('prizes')
            .select('*', {
                count: 'exact',
                head: true
            })
        .eq('claimed', false)

    setUnclaimedCount(unclaimed || 0)
  }

  async function openAttendance() {

    const { error } = await supabase
      .from('event_control')
      .update({
        attendance_open: true
      })
      .eq('id', 1)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('✅ Attendance Opened')

    await loadDashboard()
  }

  async function closeAttendance() {

    const { error } = await supabase
      .from('event_control')
      .update({
        attendance_open: false
      })
      .eq('id', 1)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('✅ Attendance Closed')

    await loadDashboard()
  }

  async function openDrawLobby() {

    const { error } = await supabase
      .from('event_control')
      .update({
        draw_lobby_open: true
      })
      .eq('id', 1)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('✅ Draw Lobby Opened')

    await loadDashboard()
  }

  async function closeDrawLobby() {

    const { error } = await supabase
      .from('event_control')
      .update({
        draw_lobby_open: false
      })
      .eq('id', 1)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('✅ Draw Lobby Closed')

    await loadDashboard()
  }

  async function resetEvent() {

    const password = prompt(
      'Enter Reset Password'
    )

    if (password !== 'JSG2026RESET') {

alert('Incorrect Password')

return
}

const confirmed = window.confirm(
'This will erase all attendance and draw records. Continue?'
)

if (!confirmed) {
return
}

const { error: attendanceError } =
await supabase
.from('attendance')
.delete()
.neq('staff_id', '')

if (attendanceError) {
setMessage(attendanceError.message)
return
}

const { error: prizeError } =
await supabase
.from('prizes')
.update({
winner_staff_id: null,
revealed: false,
claimed: false
})
.not('prize_code', 'is', null)

if (prizeError) {
setMessage(prizeError.message)
return
}

setMessage(
'✅ Event Reset Successful'
)

await loadDashboard()
}

return (
<main className="min-h-screen p-6 max-w-xl mx-auto">

<h1 className="text-3xl font-bold mb-6">
JSG Lucky Draw Admin
</h1>

<div className="bg-gray-100 rounded-lg p-4 mb-6">

<h2 className="text-xl font-bold mb-4">
Live Event Dashboard
</h2>

<p className="font-semibold">
Attendance Status:{' '}
<span
className={
attendanceOpen
? 'text-green-600'
: 'text-red-600'
}
>
{attendanceOpen
? 'OPEN'
: 'CLOSED'}
</span>
</p>

<p className="font-semibold mt-2">
Draw Lobby:{' '}
<span
className={
drawLobbyOpen
? 'text-green-600'
: 'text-red-600'
}
>
{drawLobbyOpen
? 'OPEN'
: 'CLOSED'}
</span>
</p>

<hr className="my-4" />

<p>
Checked In:
{' '}
<strong>
{checkedInCount}
</strong>
{' / '}
<strong>
{totalStaff}
</strong>
</p>

<p className="mt-2">
Drawn:
{' '}
<strong>
{drawnCount}
</strong>
</p>

<p className="mt-2">
Remaining To Draw:
{' '}
<strong>
{remainingToDraw}
</strong>
</p>

<p className="mt-2">
Remaining Prizes:
{' '}
<strong>
{remainingPrizes}
</strong>
</p>

<p className="mt-2">
Claimed Prizes:
{' '}
<strong>
{claimedCount}
</strong>
</p>

<p className="mt-2">
Unclaimed Prizes:
{' '}
<strong>
{unclaimedCount}
</strong>
</p>

</div>

<div className="space-y-4">

<button
onClick={openAttendance}
className="bg-green-600 text-white px-4 py-2 rounded w-full"
>
Open Attendance
</button>

<button
onClick={closeAttendance}
className="bg-red-600 text-white px-4 py-2 rounded w-full"
>
Close Attendance
</button>

<button
onClick={openDrawLobby}
className="bg-blue-600 text-white px-4 py-2 rounded w-full"
>
Open Draw Lobby
</button>

<button
onClick={closeDrawLobby}
className="bg-orange-600 text-white px-4 py-2 rounded w-full"
>
Close Draw Lobby
</button>

</div>

<div className="mt-10">

  <h2 className="text-2xl font-bold mb-4">
    Reports & Operations
  </h2>

  <div className="grid gap-3">

    <Link href="/admin/reports/winners">
      🏆 Winners Report
    </Link>

    <Link href="/admin/reports/unclaimed">
      🎁 Unclaimed Prize Report
    </Link>

    <Link href="/admin/reports/attendance"> 
      👥 Attendance Not Drawn
    </Link>

    <Link href="/admin/claims">
      ✅ Prize Claims
    </Link>

  </div>

</div>

<div className="mt-8">

  <button
    onClick={resetEvent}
    className="bg-gray-900 text-white px-4 py-2 rounded w-full"
  >
    ⚠ Reset Event Data
  </button>

</div>

<p className="mt-6 font-semibold">
{message}
</p>

</main>
)
}