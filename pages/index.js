// pages/index.js
import Link from 'next/link'

export default function Home() {
  return (
    <main className="container">
      <h1>Welcome to Skill Sprint</h1>
      <p>A clean, simple way to level up every day.</p>
      <Link href="/sprint" className="button">Start Sprint</Link>
    </main>
  )
}
