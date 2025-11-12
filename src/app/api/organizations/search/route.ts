import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export interface OrganizationSearchResult {
  id: string
  name: string
  member_count: number
  is_member: boolean
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the RPC function to search organizations
    const { data, error } = await supabase.rpc('search_organizations', {
      search_term: query,
      result_limit: 10,
    })

    if (error) {
      console.error('Error searching organizations:', error)
      return NextResponse.json(
        { error: 'Failed to search organizations' },
        { status: 500 }
      )
    }

    // Return the search results
    return NextResponse.json(data as OrganizationSearchResult[])
  } catch (error) {
    console.error('Unexpected error in organization search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
