'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {

  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const router = useRouter()

  function login() {

    if (password !== 'JSG2026ADMIN') {
      setMessage('Invalid password')
      return
    }

    sessionStorage.setItem(
      'adminAuthenticated',
      'true'
    )

    router.push('/admin')
  }

  return (
    <main className="min-h-screen flex items-center justify-center">

      <div className="w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6">
          Admin Login
        </h1>

        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Enter Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={login}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>

        <p className="mt-4 text-red-600">
          {message}
        </p>

      </div>

    </main>
  )
}