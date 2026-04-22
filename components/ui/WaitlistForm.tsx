'use client'

import { useState } from 'react'
import Button from './Button'
import Input from './Input'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-card bg-sage-light border border-sage px-6 py-4 text-center">
        <p className="text-sage-dark font-semibold text-sm">
          You're on the list. We'll be in touch soon.
        </p>
      </div>
    )
  }

  return (
    <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="your@email.com"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
        required
      />
      <Button type="submit">Join Waitlist</Button>
    </form>
  )
}
