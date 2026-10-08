'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DrawPage() {

  const [staffId, setStaffId] = useState('')
  const [staffDOB, setStaffDOB] = useState('')
  const [message, setMessage] = useState('')
  const [rewardCode, setRewardCode] = useState('')
  const [drawLobbyOpen, setDrawLobbyOpen] = useState(false)
  const [alreadyJoined, setAlreadyJoined] = useState(false)
  const [assignmentCompleted, setAssignmentCompleted] = useState(false)
  const [revealOpen, setRevealOpen] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  
  useEffect(() => {
  loadControl()

  const interval =
    setInterval(() => {
      loadControl()
    }, 3000)

  return () => clearInterval(interval)
  }, [])

  async function loadControl() {

    const { data, error } = await supabase
      .from('event_control')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !data) {
      setDrawLobbyOpen(false)
      return
    }
    console.log(
  'CONTROL',
  data
)

    setDrawLobbyOpen(data.draw_lobby_open)
    setAssignmentCompleted(data.assignment_completed)
    setRevealOpen(data.reveal_open)
  }

  async function joinLobby() {

    if (!drawLobbyOpen) {
    setMessage(
      'Draw lobby is closed'
    )
    return
    }

    if (assignmentCompleted) {
    setMessage(
      'Please wait for the lucky draw session to begin.'
    )
    return
    }

    setMessage('Verifying...')
    setRewardCode('')
    setAlreadyJoined(false)

    // Verify Employee

    const { data: staff, error: staffError } =
      await supabase
        .from('staff_master')
        .select('*')
        .eq('staff_id', staffId.trim())
        .eq('dob', staffDOB.trim())
        .single()

    if (staffError || !staff) {
      setMessage(
        'Invalid Staff ID or Date of Birth'
      )
      return
    }

    // Check Attendance Record

    const { data: attendance } =
      await supabase
        .from('attendance')
        .select('*')
        .eq('staff_id', staff.staff_id)
        .maybeSingle()

    if (!attendance) {
      setMessage(
        'You must complete attendance check-in first'
      )
      return
    }

    if (attendance.joined_draw_lobby) {

    setAlreadyJoined(true)

    setMessage(
      '✅ You have already joined the draw lobby'
    )

    return
    }

    const { error } =
      await supabase
      .from('attendance')
      .update({
      joined_draw_lobby: true,
      draw_join_time:
        new Date().toISOString()
      })
      .eq(
        'staff_id',
        staff.staff_id
      )

    if (error) {
      setMessage(
      'Unable to join draw lobby'
      )

    return
    }
    setAlreadyJoined(true)
    setMessage(
      '✅ Successfully joined the draw lobby'
    )
  }

  async function revealPrize() {

  setMessage('Verifying...')

  const { data: staff, error } =
    await supabase
      .from('staff_master')
      .select('*')
      .eq('staff_id', staffId.trim())
      .eq('dob', staffDOB.trim())
      .single()

  if (error || !staff) {

    setMessage(
      'Invalid Staff ID or Date of Birth'
    )

    return
  }

  const { data: attendance } =
    await supabase
      .from('attendance')
      .select('*')
      .eq(
        'staff_id',
        staff.staff_id
      )
      .single()

  if (
    !attendance ||
    !attendance.joined_draw_lobby
  ) {

    setMessage(
      'You did not join the draw lobby'
    )

    return
  }

  setIsRevealing(true)

  const interval = setInterval(() => {

    const randomCode =
      'P' +
      String(
        Math.floor(
          Math.random() * 999
        )
      ).padStart(3, '0')

    setRewardCode(randomCode)

  }, 100)

  setTimeout(() => {

    clearInterval(interval)

    setRewardCode(
      attendance.prize_code
    )

    setMessage(
      '🎉 Congratulations'
    )

    setIsRevealing(false)

  }, 3000)
}

  if (!drawLobbyOpen && !revealOpen) {

  return (
    <main className="min-h-screen flex items-center justify-center">

      <div className="text-center">

        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Draw Lobby Closed
        </h1>

        <p>
          Please wait for the lucky draw session to begin.
        </p>

      </div>

    </main>
  )
}

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        ONE1JSG Lucky Draw
      </h1>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Staff ID"
        value={staffId}
        onChange={(e) =>
          setStaffId(e.target.value)
        }
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Date of Birth (ddmmyyyy)"
        value={staffDOB}
        onChange={(e) =>
          setStaffDOB(e.target.value)
        }
      />

      {drawLobbyOpen &&
      !assignmentCompleted &&
      !alreadyJoined && (

      <button
        onClick={joinLobby}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Join Draw Lobby
      </button>
      )}

      <p className="mt-4 font-semibold">
        {message}
      </p>
      
      {alreadyJoined && !revealOpen && (

      <div className="mt-6 text-center">
      <p className="text-lg">
        You are now in the draw lobby.
      </p>

      <p className="text-gray-500 mt-2">
        Please wait for the lucky draw session to begin.
      </p>
      </div>
      )}

      {assignmentCompleted && revealOpen && (
      <button
        onClick={revealPrize}
        className="bg-purple-600 text-white px-6 py-3 rounded mt-6 w-full"
      >
      🎁 DRAW NOW
      </button>
      )}

      {rewardCode && (

  <div className="mt-8 text-center">

    {isRevealing && (

      <p className="text-xl font-bold text-orange-600">

        🎰 Drawing Your Prize...

      </p>

    )}

    <p className="text-lg text-gray-600 mt-4">

      Your Mystery Reward Code

    </p>

    <div
      className={`
        text-6xl
        font-bold
        mt-2
        ${
          isRevealing
            ? 'text-orange-500'
            : 'text-green-600'
        }
      `}
    >
      {rewardCode}
    </div>

  </div>

)}
    </main>
  )
}