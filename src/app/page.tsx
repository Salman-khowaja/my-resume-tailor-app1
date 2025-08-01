'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null)
  const [resume, setResume] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [tailored, setTailored] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'tailor' | 'history'>('tailor')
  type HistoryItem = {
    createdAt: string
    jobDesc: string
    tailored: string
  }
  const [history, setHistory] = useState<HistoryItem[]>([])
  const tailoredRef = useRef<HTMLDivElement>(null)

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      
      if (!res.ok) {
        console.error('❌ History API Error:', data)
        alert(`Error fetching history: ${data.error || 'Failed to fetch history'}`)
        return
      }
      
      setHistory(data.history || [])
    } catch (error) {
      console.error('❌ Network error fetching history:', error)
      alert('Failed to fetch history. Please try again.')
    }
  }

  const router = useRouter()

  // 🔒 Check login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else setSession(session)
    })
  }, [])

  // Load history when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory()
    }
  }, [activeTab])

  // 🧠 Handle tailoring
  const handleTailor = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobDesc })
      })

      const data = await res.json()
      
      if (!res.ok) {
        console.error('❌ API Error:', data)
        const errorMessage = data.error || 'Failed to tailor resume'
        const debugInfo = data.debug ? `\n\nDebug: ${data.debug}` : ''
        alert(`Error: ${errorMessage}${debugInfo}`)
        setLoading(false)
        return
      }

      if (data.tailoredResume) {
        setTailored(data.tailoredResume)        
        setTimeout(() => {
          tailoredRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }, 100)
      } else {
        console.error('❌ No tailored resume in response:', data)
        alert('No tailored resume received from the server')
      }
    } catch (error) {
      console.error('❌ Network error:', error)
      alert('Network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Resume Tailor</h1>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('tailor')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'tailor' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Tailor Resume
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === 'history' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}
            className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === 'tailor' ? 'Tailor Your Resume' : 'Resume History'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'tailor' 
                ? 'Transform your resume to match any job description with AI-powered customization'
                : 'View your previous resume tailoring sessions'
              }
            </p>
          </div>

          {/* Tailor Tab */}
          {activeTab === 'tailor' && (
            <div className="space-y-8">
              {/* Input Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Your Resume</h3>
                  </div>
                          <textarea
                placeholder="Paste your resume here..."
                    className="input-field w-full h-64 resize-none"
                onChange={(e) => setResume(e.target.value)}
                value={resume}
              />
          </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
                  </div>
            <textarea
              placeholder="Paste job description here..."
                    className="input-field w-full h-64 resize-none"
              onChange={(e) => setJobDesc(e.target.value)}
              value={jobDesc}
            />
          </div>
        </div>

              {/* Action Button */}
              <div className="flex justify-center">
          <button
            onClick={handleTailor}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-12 py-4 text-lg"
            disabled={loading || !resume || !jobDesc}
          >
            {loading ? (
              <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Processing...
              </div>
            ) : (
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Tailor Resume
                    </div>
            )}
          </button>
        </div>

        {/* Tailored Result */}
        {tailored && (
                <div ref={tailoredRef} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Tailored Resume</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">{tailored}</pre>
            </div>
                </div>
              )}
          </div>
        )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {history && history.length > 0 ? (
                                history.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      <p className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <p className="font-semibold text-gray-700 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                          Job Description
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700">{item.jobDesc}</pre>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-gray-700 mb-3 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Tailored Resume
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700">{item.tailored}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg mb-2">No resume history found</p>
                  <p className="text-gray-400 text-sm">Your tailored resumes will appear here</p>
                </div>
              )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
