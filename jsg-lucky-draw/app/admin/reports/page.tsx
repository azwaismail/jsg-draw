'use client'

import Link from 'next/link'

export default function ReportsHomePage() {

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">
        Reports Center
      </h1>

      <div className="space-y-4">

        /admin/reports/winners
          🏆 Winners Report
        </Link>

        /admin/reports/unclaimed
          🎁 Unclaimed Prize Report
        </Link>

        /admin/reports/attendance
          👥 Attendance But Did Not Draw
        </Link>

        /admin/claims
          ✅ Prize Claims
        </Link>

      </div>

    </main>
  )
}