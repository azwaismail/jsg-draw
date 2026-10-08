'use client'

import AdminGuard from '@/components/AdminGuard'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UnclaimedReport() {

  const [neverDrawn, setNeverDrawn] = useState<any[]>([])
  const [notClaimed, setNotClaimed] = useState<any[]>([])

  useEffect(() => {
    loadReport()
  }, [])

  async function loadReport() {

    const { data: neverDrawnData } = await supabase
      .from('prizes')
      .select('*')
      .is('winner_staff_id', null)
      .order('prize_code')

    setNeverDrawn(neverDrawnData || [])

    const { data: unclaimedData } = await supabase
      .from('prizes')
      .select('*')
      .not('winner_staff_id', 'is', null)
      .eq('claimed', false)
      .order('prize_code')

    const result = await Promise.all(
      (unclaimedData || []).map(async (prize) => {

        const { data: staff } = await supabase
          .from('staff_master')
          .select('full_name')
          .eq('staff_id', prize.winner_staff_id)
          .maybeSingle()

        return {
          ...prize,
          winner_name: staff?.full_name || ''
        }
      })
    )

    setNotClaimed(result)
  }

  function exportCsv() {

  const rows: string[][] = [

    [
      'Category',
      'Prize Code',
      'Prize Name',
      'Winner Name',
      'Winner Staff ID'
    ]

  ]

  neverDrawn.forEach((prize) => {

    rows.push([
      'Never Drawn',
      prize.prize_code,
      prize.prize_name,
      '',
      ''
    ])

  })

  notClaimed.forEach((prize) => {

    rows.push([
      'Not Claimed',
      prize.prize_code,
      prize.prize_name,
      prize.winner_name,
      prize.winner_staff_id
    ])

  })

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
    'unclaimed_prizes.csv'

  link.click()

  URL.revokeObjectURL(url)
}

  return (
    <AdminGuard>
    <main className="min-h-screen p-6 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Unclaimed Prize Report
      </h1>

      <div className="bg-yellow-100 p-4 rounded mb-6">
        <h2 className="text-xl font-bold">
          Total Bonus Prize Pool:
          {' '}
          {neverDrawn.length + notClaimed.length}
        </h2>
      </div>

      <button
  onClick={exportCsv}
  className="bg-green-600 text-white px-4 py-2 rounded mb-6"
>
  Export Unclaimed CSV
</button>

      <h2 className="text-2xl font-bold text-red-600 mb-3">
        Never Drawn ({neverDrawn.length})
      </h2>

      <table className="w-full border mb-10">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Prize Code</th>
            <th className="border p-2">Prize Name</th>
          </tr>
        </thead>

        <tbody>
          {neverDrawn.map((prize) => (
            <tr key={prize.prize_code}>
              <td className="border p-2">
                {prize.prize_code}
              </td>

              <td className="border p-2">
                {prize.prize_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-bold text-orange-600 mb-3">
        Drawn But Not Claimed ({notClaimed.length})
      </h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Prize Code</th>
            <th className="border p-2">Prize Name</th>
            <th className="border p-2">Winner Name</th>
            <th className="border p-2">Winner Staff ID</th>
          </tr>
        </thead>

        <tbody>
          {notClaimed.map((prize) => (
            <tr key={prize.prize_code}>

              <td className="border p-2">
                {prize.prize_code}
              </td>

              <td className="border p-2">
                {prize.prize_name}
              </td>

              <td className="border p-2">
                {prize.winner_name}
              </td>

              <td className="border p-2">
                {prize.winner_staff_id}
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </main>
    </AdminGuard>
  )
}