'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DrawPage() {

  const [staffId, setStaffId] = useState('')
  const [staffDOB, setStaffDOB] = useState('')

  const [message, setMessage] = useState('')
  const [rewardCode, setRewardCode] = useState('')

  const [drawLobbyOpen, setDrawLobbyOpen] =
    useState(false)

  useEffect(() => {
    loadControl()
  }, [])

  async function loadControl() {

    const { data, error } = await supabase
      .from('event_control')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      console.log(error)
      return
    }

    setDrawLobbyOpen(data.draw_lobby_open)
  }

  async function drawPrize() {

    setMessage('Verifying...')
    setRewardCode('')

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

    // Already Drawn

    if (attendance.prize_code) {

      setRewardCode(
        attendance.prize_code
      )

      setMessage(
        '✅ Prize Already Drawn'
      )

      return
    }

    // =====================================================
    // STEP 1 - CHECK PREASSIGNED PRIZE
    // =====================================================

    const { data: preassignedPrize } =
      await supabase
        .from('prizes')
        .select('*')
        .eq(
          'assigned_staff_id',
          staff.staff_id
        )
        .is('winner_staff_id', null)
        .maybeSingle()

    if (preassignedPrize) {

      await supabase
        .from('prizes')
        .update({
          winner_staff_id:
            staff.staff_id
        })
        .eq(
          'prize_code',
          preassignedPrize.prize_code
        )

      await supabase
        .from('attendance')
        .update({
          joined_draw_lobby: true,
          draw_join_time:
            new Date().toISOString(),
          prize_code:
            preassignedPrize.prize_code,
          prize_assigned: true
        })
        .eq(
          'staff_id',
          staff.staff_id
        )

      setRewardCode(
        preassignedPrize.prize_code
      )

      setMessage(
        '🎉 Congratulations'
      )

      return
    }

    // =====================================================
    // STEP 2 - RANDOM PRIZE
    // =====================================================

    const { data: randomPrizes } =
      await supabase
        .from('prizes')
        .select('*')
        .eq('prize_type', 'RANDOM')
        .is('winner_staff_id', null)

    if (
      !randomPrizes ||
      randomPrizes.length === 0
    ) {
      setMessage(
        'No prizes remaining'
      )
      return
    }

    const selectedPrize =
      randomPrizes[
        Math.floor(
          Math.random() *
          randomPrizes.length
        )
      ]

    await supabase
      .from('prizes')
      .update({
        winner_staff_id:
          staff.staff_id
      })
      .eq(
        'prize_code',
        selectedPrize.prize_code
      )

    await supabase
      .from('attendance')
      .update({
        joined_draw_lobby: true,
        draw_join_time:
          new Date().toISOString(),
        prize_code:
          selectedPrize.prize_code,
        prize_assigned: true
      })
      .eq(
        'staff_id',
        staff.staff_id
      )

    setRewardCode(
      selectedPrize.prize_code
    )

    setMessage(
      '🎉 Congratulations'
    )
  }

  if (!drawLobbyOpen) {
    return (
      <main className="min-h-screen flex items-center justify-center">

        <div className="text-center">

          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Draw Lobby Closed
          </h1>

          <p>
            Please wait for the lucky draw session.
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

      <button
        onClick={drawPrize}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Draw Prize
      </button>

      <p className="mt-4 font-semibold">
        {message}
      </p>

      {rewardCode && (
        <div className="mt-8 text-center">

          <p className="text-lg text-gray-600">
            Your Mystery Reward Code
          </p>

          <div className="text-6xl font-bold text-green-600 mt-2">
            {rewardCode}
          </div>

        </div>
      )}

    </main>
  )
}