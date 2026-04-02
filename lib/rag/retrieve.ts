import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function retrieveChunks(query: string, matchCount = 5) {
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  })

  const queryEmbedding = embeddingResponse.data[0].embedding

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_count: matchCount
  })

  if (error) {
    throw error
  }

  return data || []
}