import React from 'react'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useAuth } from '@clerk/nextjs'
import Members from '../../pages/members'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// Mock Clerk's useAuth
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn()
}))

describe('Authentication Flow', () => {
  const mockRouter = {
    push: jest.fn()
  }

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('redirects to sign-in when not authenticated', () => {
    // Mock unauthenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      userId: null
    })

    render(<Members />)
    expect(mockRouter.push).toHaveBeenCalledWith('/sign-in')
  })

  it('shows content when authenticated', () => {
    // Mock authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      userId: 'test-user-id'
    })

    render(<Members />)
    expect(screen.getByText('Members Area')).toBeInTheDocument()
  })
}) 