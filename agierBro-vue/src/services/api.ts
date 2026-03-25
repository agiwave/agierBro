import type { Schema, DataObject } from '@/types'

const BASE_URL = '/api'

export async function fetchPageData(entity: string, id?: string): Promise<DataObject> {
  const url = id ? `${BASE_URL}/${entity}/${id}.json` : `${BASE_URL}/${entity}.json`
  console.log('Fetch:', url)
  const response = await fetch(url)
  if (!response.ok) {
    const text = await response.text()
    console.error('API Error:', response.status, text)
    throw new Error(`Failed to fetch: ${url} (${response.status})`)
  }
  return response.json()
}

export function extractSchema(data: DataObject): Schema | null {
  const ref = data._schema
  if (!ref) return null
  if (typeof ref === 'object') return ref as Schema
  // 内置 Schema 字符串（@nav, @tree, @tabs, @content, @link）
  if (ref.startsWith('@')) {
    return { type: 'object', properties: {} }
  }
  console.warn('Schema reference not supported:', ref)
  return null
}

export async function saveData(url: string, data: DataObject): Promise<DataObject> {
  await new Promise(r => setTimeout(r, 500))
  console.log('Save:', url, data)
  return { ...data, updated_at: new Date().toISOString() }
}

export async function transition(url: string, event: string): Promise<DataObject> {
  await new Promise(r => setTimeout(r, 500))
  console.log('Transition:', event)
  return { status: event === 'submit' ? 'pending' : 'approved' }
}
