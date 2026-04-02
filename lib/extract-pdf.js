const fs = require('fs')
const { PDFParse } = require('pdf-parse')
const dotenv = require('dotenv')
const { createClient } = require('@supabase/supabase-js')

dotenv.config({ path: '.env.local', override: true })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function chunkText(text, chunkSize = 800, overlap = 100) {
  const words = text.split(/\s+/)
  const chunks = []

  let i = 0
  let chunkIndex = 0

  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    chunks.push({
      content: chunk,
      metadata: {
        source: 'daniels-running-formula.pdf',
        source_type: 'coaching_manual',
        chunk_index: chunkIndex
      }
    })
    i += chunkSize - overlap
    chunkIndex += 1
  }

  return chunks
}

function cleanText(text) {
  let cleaned = text.replace(/--\s*\d+\s+of\s+\d+\s*--/g, ' ')
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  return cleaned
}

async function extractAndInsert() {
  const path = "rag_sources/Daniels' Running Formula PDF.pdf"
  const file = fs.readFileSync(path)

  const parser = new PDFParse({ data: file })
  const data = await parser.getText()

  const cleaned = cleanText(data.text)
  const chunks = chunkText(cleaned)

  console.log('total chunks to insert:', chunks.length)

  const { data: inserted, error } = await supabase
    .from('knowledge_chunks')
    .insert(chunks)
    .select()

  if (error) {
    console.error('INSERT ERROR:', error)
    return
  }

  console.log('✅ inserted rows:', inserted.length)
}

extractAndInsert().catch(err => {
  console.error('SCRIPT ERROR:', err)
})