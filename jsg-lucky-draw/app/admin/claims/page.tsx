'use client'

import AdminGuard from '@/components/AdminGuard'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ClaimsPage() {

  const [staffId, setStaffId] = useState('')
  const [prizeCode, setPrizeCode] = useState('')

  const [message, setMessage] = useState('')

  const [prize, setPrize] = useState<any>(null)

  const [winnerName, setWinnerName] = useState('')

  async function loadWinnerName(
    winnerStaffId: string
  ) {

    if (!winnerStaffId) {
      setWinnerName('')
      return
    }

    const { data } = await supabase
      .from('staff_master')
      .select('full_name')
      .eq('staff_id', winnerStaffId)
      .maybeSingle()

    setWinnerName(
      data?.full_name || ''
    )
  }

  async function searchByStaff() {

    setMessage('')
    setPrize(null)
    setWinnerName('')

    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq(
        'winner_staff_id',
        staffId.trim()
      )
      .maybeSingle()

    if (error || !data) {
      setMessage(
      'No prize found for this staff'
      )
      return
    }

    setPrize(data)

    await loadWinnerName(
      data.winner_staff_id
    )
  }

  async function searchByPrize() {

    setMessage('')
    setPrize(null)
    setWinnerName('')

    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq(
        'prize_code',
        prizeCode.trim()
      )
      .maybeSingle()

    if (error || !data) {
      setMessage(
        'Prize not found'
      )
      return
    }

    setPrize(data)

    await loadWinnerName(
      data.winner_staff_id
    )
  }

  async function markClaimed() {

    if (!prize) return

    const confirmed =
      window.confirm(
        `Mark ${prize.prize_code} as claimed?`
      )

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from('prizes')
      .update({
        claimed: true
      })
      .eq(
        'prize_code',
        prize.prize_code
      )

    if (error) {
      setMessage(error.message)
      return
    }

    setPrize({
      ...prize,
      claimed: true
    })

    setMessage(
      `✅ ${prize.prize_code} marked as claimed`
    )
  }

  return (
    <AdminGuard>
    <main className="min-h-screen p-6 max-w-xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Prize Claims
      </h1>

      <div className="border rounded p-4 mb-6">

        <h2 className="font-semibold mb-3">
          Search By Staff ID
        </h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Staff ID"
          value={staffId}
          onChange={(e) =>
            setStaffId(e.target.value)
          }
        />

        <button
          onClick={searchByStaff}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search Staff
        </button>

      </div>

      <div className="border rounded p-4 mb-6">

        <h2 className="font-semibold mb-3">
          Search By Prize Code
        </h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Prize Code"
          value={prizeCode}
          onChange={(e) =>
            setPrizeCode(e.target.value)
          }
        />

        <button
          onClick={searchByPrize}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Search Prize
        </button>

      </div>

      {message && (

        <div className="mb-4 font-semibold">
          {message}
        </div>

      )}

      {prize && (

        <div className="border rounded p-6">

          <h2 className="text-xl font-bold mb-4">
            Prize Details
          </h2>

          <div className="space-y-2">

            <p>
              <strong>Prize Code:</strong>{' '}
              {prize.prize_code}
            </p>

            <p>
              <strong>Prize Name:</strong>{' '}
              {prize.prize_name}
            </p>

            <p>
              <strong>Winner Name:</strong>{' '}
              {winnerName || '-'}
            </p>

            <p>
              <strong>Winner Staff ID:</strong>{' '}
              {prize.winner_staff_id || '-'}
            </p>

            <p>
              <strong>Claim Status:</strong>{' '}
              {prize.claimed
                ? '✅ Claimed'
                : '❌ Not Claimed'}
            </p>

          </div>

          {!prize.claimed && (

            <button
              onClick={markClaimed}
              className="bg-purple-600 text-white px-4 py-2 rounded mt-6"
            >
              Mark Claimed
            </button>

          )}

        </div>

      )}

    </main>
    </AdminGuard>
  )
}