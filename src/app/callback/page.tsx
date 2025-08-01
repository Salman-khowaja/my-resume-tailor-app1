'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get the current URL to check for auth parameters
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')
        const errorDescription = url.searchParams.get('error_description')

        if (error) {
          console.error('Auth error:', error, errorDescription)
          setStatus('error')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        if (code) {
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('Session exchange error:', exchangeError)
            setStatus('error')
            setTimeout(() => router.push('/login'), 2000)
            return
          }

          if (data.session) {
            setStatus('success')
            setTimeout(() => router.push('/'), 1000)
            return
          }
        }

        // If no code, check if we already have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session check error:', sessionError)
          setStatus('error')
          setTimeout(() => router.push('/login'), 2000)
          return
        }

        if (session) {
          setStatus('success')
          setTimeout(() => router.push('/'), 1000)
        } else {
          setStatus('error')
          setTimeout(() => router.push('/login'), 2000)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setTimeout(() => router.push('/login'), 2000)
      }
    }

    handleAuth()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Logging you in...</h2>
            <p className="text-gray-600">Please wait while we authenticate your session</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Success!</h2>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Authentication Failed</h2>
            <p className="text-gray-600">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  )
}
