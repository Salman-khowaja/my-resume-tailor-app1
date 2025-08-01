import { connectToDatabase } from '@/lib/mongo'
import Resume from '@/models/Resume'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {}
      }
    }
  )
  const { data: { session } } = await supabase.auth.getSession()
  const email = session?.user.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectToDatabase()
  const history = await Resume.find({ email }).sort({ createdAt: -1 }).lean()

  return NextResponse.json({ history })
}
