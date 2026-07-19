// src/app/page.tsx
import { redirect } from 'next/navigation'

// La racine redirige vers le dashboard ou le login
export default function Home() {
  redirect('/dashboard')
}
