import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_members')
    .select('profiles(id, full_name)')
    .eq('project_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const members = data?.map((m) => ({
    id: (m.profiles as { id: string; full_name: string }).id,
    full_name: (m.profiles as { id: string; full_name: string }).full_name,
  })) || []

  return NextResponse.json(members)
}
