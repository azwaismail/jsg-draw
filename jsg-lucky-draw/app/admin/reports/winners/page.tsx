'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function WinnersReport() {

  const [winners, setWinners] = useState<any[]>([])
  const [claimedCount, setClaimedCount] = useState(0)
  const [unclaimedCount, setUnclaimedCount] = useState(0)

  useEffect(() => {
    loadReport()
  }, [])

  async function loadReport() {

    const { data: prizes } = await supabase
      .from('prizes')
      .select('*')
      .not('winner_staff_id', 'is', null)
      .order('prize_code')

    const enrichedWinners = await Promise.all(

      (prizes || []).map(async (prize) => {

        const { data: staff } = await supabase
          .from('staff_master')
          .select('full_name, department')
          .eq(
            'staff_id',
            prize.winner_staff_id
          )
          .maybeSingle()

        return {
          ...prize,
          winner_name:
            staff?.full_name || '',
          department:
            staff?.department || ''
        }
      })

    )

    setWinners(enrichedWinners)

    setClaimedCount(
        enrichedWinners.filter(
            (w) => w.claimed
        ).length
    )

    setUnclaimedCount(
        enrichedWinners.filter(
            (w) => !w.claimed
        ).length
    )
  }

function exportCsv() {

  const rows = [

    [
      'Prize Code',
      'Prize Name',
      'Winner Name',
      'Staff ID',
      'Department',
      'Claimed'
    ],

    ...winners.map((winner) => [

      winner.prize_code,
      winner.prize_name,
      winner.winner_name,
      winner.winner_staff_id,
      winner.department,
      winner.claimed ? 'Yes' : 'No'

    ])

  ]

  const csvContent = rows
    .map((row) => row.join(','))
    .join('\n')

  const blob = new Blob(
    [csvContent],
    {
      type: 'text/csv;charset=utf-8;'
    }
  )

  const url = URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  link.href = url

  link.download =
    'winners_report.csv'

  link.click()

  URL.revokeObjectURL(url)
}

  return (

    <main className="min-h-screen p-6 max-w-7xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Winners Report
      </h1>

      <div className="bg-green-100 p-4 rounded mb-6">

        <h2 className="text-xl font-bold mb-3">
            Winners Summary
        </h2>

        <p>
            Total Winners:{' '}
            <strong>
                {winners.length}
            </strong>
        </p>

        <p className="mt-2 text-green-700">
            ✅ Claimed:{' '}
            <strong>
                {claimedCount}
            </strong>
        </p>

        <p className="mt-2 text-red-700">
            ❌ Unclaimed:{' '}
            <strong>
                {unclaimedCount}
            </strong>
        </p>

      </div>

      <button
  onClick={exportCsv}
  className="bg-green-600 text-white px-4 py-2 rounded mb-6"
>
  Export Winners CSV
</button>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">

            <th className="border p-2">
              Prize Code
            </th>

            <th className="border p-2">
              Prize Name
            </th>

            <th className="border p-2">
              Winner Name
            </th>

            <th className="border p-2">
              Staff ID
            </th>

            <th className="border p-2">
              Department
            </th>

            <th className="border p-2">
              Claimed
            </th>

          </tr>

        </thead>

        <tbody>

          {winners.map((winner) => (

            <tr
              key={winner.prize_code}
            >

              <td className="border p-2">
                {winner.prize_code}
              </td>

              <td className="border p-2">
                {winner.prize_name}
              </td>

              <td className="border p-2">
                {winner.winner_name}
              </td>

              <td className="border p-2">
                {winner.winner_staff_id}
              </td>

              <td className="border p-2">
                {winner.department}
              </td>

              <td className="border p-2">

                {winner.claimed
                  ? '✅ Claimed'
                  : '❌ Not Claimed'}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </main>

  )
}