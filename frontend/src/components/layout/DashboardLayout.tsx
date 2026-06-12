import { Link, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'

const NAV_ITEMS = [
  {
    to: '/event-types' as const,
    label: 'Event Types',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/availability' as const,
    label: 'Availability',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/meetings' as const,
    label: 'Meetings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

interface Props {
  children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100">
          <div className="w-7 h-7 rounded-full bg-calendly-blue flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-base font-semibold text-gray-900">Calendly</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-calendly-blue'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={active ? 'text-calendly-blue' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-calendly-blue text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              AJ
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Alex Johnson</p>
              <p className="text-xs text-gray-400 truncate">alex@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom tab bar — mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                active ? 'text-calendly-blue' : 'text-gray-400'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
