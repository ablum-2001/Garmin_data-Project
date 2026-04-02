const dotenv = require('dotenv')
const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')

dotenv.config({ path: '.env.local', override: true })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function retrieveChunks(query) {
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  })

  const queryEmbedding = embeddingResponse.data[0].embedding

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_count: 5
  })

  if (error) {
    console.error('RETRIEVAL ERROR:', error)
    return
  }

  console.log(`Query: ${query}`)
  console.log('\nTop matches:\n')

  data.forEach((row, index) => {
    console.log(`--- Match ${index + 1} ---`)
    console.log('Similarity:', row.similarity)
    console.log('Source:', row.metadata?.source)
    console.log('Preview:', row.content.slice(0, 300))
    console.log('')
  })
}

retrieveChunks('How should I structure long runs for marathon training?').catch(err => {
  console.error('SCRIPT ERROR:', err)
})