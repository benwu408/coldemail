import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { v4 as uuidv4 } from 'uuid'
import pdf from 'pdf-parse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Get user ID from the request (you might need to adjust this based on your auth setup)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from PDF
    let resumeText = ''
    
    try {
      resumeText = await extractTextFromPDF(buffer)
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 })
    }

    // Update the user's profile with the resume text
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        resume_text: resumeText,
        resume_filename: file.name,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (updateError) {
      console.error('Error updating profile with resume:', updateError)
      return NextResponse.json({ error: 'Failed to save resume to profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      resume_text: resumeText,
      filename: file.name
    })

  } catch (error) {
    console.error('Error processing resume upload:', error)
    return NextResponse.json({ error: 'Failed to process resume' }, { status: 500 })
  }
}

// PDF text extraction function using pdf-parse
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error('Failed to parse PDF file')
  }
} 