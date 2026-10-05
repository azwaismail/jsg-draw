'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AttendanceReport() {

  const [staff, setStaff] = useState<any[]>([])

  useEffect(() => {
    loadReport()
  }, [])

  async function loadReport() {

    const { data: attendanceData, error } =
      await supabase
        .from('attendance')
        .select('*')
        .is('prize_code', null)

    if (error) {
      console.log(error)
      return
    }

    const enrichedData =
      await Promise.all(

        (attendanceData || []).map(

          async (record) => {

            const { data: employee } =
              await supabase
                .from('staff_master')
                .select(
                  'full_name, department'
                )
                .eq(
                  'staff_id',
                  record.staff_id
                )
                .maybeSingle()

            return {
              ...record,
              full_name:
                employee?.full_name || '',
              department:
                employee?.department || ''
            }
          }

        )

      )

    setStaff(enrichedData)
  }

  function exportCsv() {

  const rows = [

    [
      'Staff ID',
      'Name',
      'Department',
      'Check-In Time'
    ],

    ...staff.map((person) => [

      person.staff_id,
      person.full_name,
      person.department,
      person.checkin_time

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
    'attendance_not_drawn.csv'

  link.click()

  URL.revokeObjectURL(url)
}

  return (

    <main className="min-h-screen p-6 max-w-7xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Attendance But Did Not Draw
      </h1>

      <div className="bg-blue-100 p-4 rounded mb-6">

        <h2 className="text-xl font-bold">
          Total Staff Not Drawn:{' '}
          {staff.length}
        </h2>

      </div>

      <button
  onClick={exportCsv}
  className="bg-green-600 text-white px-4 py-2 rounded mb-6"
>
  Export Attendance CSV
</button>

      <table className="w-full border">

        <thead>

          <tr className="bg-gray-100">

            <th className="border p-2">
              Staff ID
            </th>

            <th className="border p-2">
              Name
            </th>

            <th className="border p-2">
              Department
            </th>

            <th className="border p-2">
              Check-In Time
            </th>

          </tr>

        </thead>

        <tbody>

          {staff.map((person) => (

            <tr
              key={person.staff_id}
            >

              <td className="border p-2">
                {person.staff_id}
              </td>

              <td className="border p-2">
                {person.full_name}
              </td>

              <td className="border p-2">
                {person.department}
              </td>

              <td className="border p-2">

                {person.checkin_time
                  ? new Date(
                      person.checkin_time
                    ).toLocaleString()
                  : '-'}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </main>

  )
}