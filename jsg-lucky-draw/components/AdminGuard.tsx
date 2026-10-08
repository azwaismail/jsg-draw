'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode
}) {

  const [allowed, setAllowed] =
    useState(false)

  const router = useRouter()

  useEffect(() => {

    const auth =
      sessionStorage.getItem(
        'adminAuthenticated'
      )

    if (!auth) {
      router.push('/admin/login')
      return
    }

    setAllowed(true)

  }, [router])

  if (!allowed) {
    return null
  }

  return <>{children}</>
}