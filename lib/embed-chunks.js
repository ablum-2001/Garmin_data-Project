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

async function embedChunks() {
  const { data: rows, error } = await supabase
    .from('knowledge_chunks')
    .select('id, content')
    .is('embedding', null)
    .limit(20)

  if (error) {
    console.error('FETCH ERROR:', error)
    return
  }

  if (!rows || rows.length === 0) {
    console.log('No chunks need embeddings')
    return
  }

  console.log(`Embedding ${rows.length} chunks...`)

  for (const row of rows) {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: row.content
    })

    const embedding = response.data[0].embedding

    const { error: updateError } = await supabase
      .from('knowledge_chunks')
      .update({ embedding })
      .eq('id', row.id)

    if (updateError) {
      console.error(`UPDATE ERROR for ${row.id}:`, updateError)
      continue
    }

    console.log(`✅ Embedded ${row.id}`)
  }
}

embedChunks().catch(err => {
  console.error('SCRIPT ERROR:', err)
})