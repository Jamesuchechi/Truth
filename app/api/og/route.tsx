import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type') || 'default'
    const title = searchParams.get('title') || 'TRUTH_SIGNAL'
    const author = searchParams.get('author') || 'ANONYMOUS_NODE'
    const content = searchParams.get('content') || ''
    const username = searchParams.get('username') || ''
    const tier = searchParams.get('tier') || 'SIGNAL'

    const truncated = content.length > 120 ? content.substring(0, 117) + '...' : content

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#0A0A0A',
            backgroundImage:
              'radial-gradient(circle at 25px 25px, #1F1F1F 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1F1F1F 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Top red bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', backgroundColor: '#FF3366' }} />
          {/* Left red bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '5px', backgroundColor: '#FF3366' }} />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '40px 80px 0 80px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#FF3366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '16px', height: '16px', backgroundColor: '#0A0A0A', transform: 'rotate(45deg)' }} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#FF3366', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                TRUTH
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255,51,102,0.1)',
                border: '1px solid rgba(255,51,102,0.3)',
                padding: '6px 16px',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FF3366' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF3366', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                LIVE_SIGNAL
              </span>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30px 80px' }}>
            {/* Post type */}
            {type === 'post' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#FF3366' }} />
                  <span style={{ fontSize: '13px', color: '#FF3366', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                    {author}
                  </span>
                </div>
                <p style={{ fontSize: truncated ? '34px' : '42px', color: '#E0E0E0', fontWeight: 700, lineHeight: 1.35, margin: 0, maxWidth: '900px', fontStyle: truncated ? 'normal' : 'italic' }}>
                  {truncated ? `"${truncated}"` : title}
                </p>
              </div>
            )}

            {/* Profile type */}
            {type === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ width: '70px', height: '70px', backgroundColor: '#141414', border: '2px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#FF3366' }}>
                    {(username || '?')[0].toUpperCase()}
                  </span>
                </div>
                <h1 style={{ fontSize: '64px', fontWeight: 900, color: '#E0E0E0', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                  {username}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.2)', padding: '6px 14px', width: 'fit-content' }}>
                  <span style={{ fontSize: '12px', color: '#FF3366', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                    {tier}
                  </span>
                </div>
              </div>
            )}

            {/* Default / fallback */}
            {(type === 'default' || (type !== 'post' && type !== 'profile')) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ padding: '8px 16px', backgroundColor: '#FF3366', color: '#0A0A0A', fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '4px' }}>
                    PROTOCOL_SECURE
                  </div>
                  <div style={{ color: '#888888', fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {type}
                  </div>
                </div>
                <div style={{ fontSize: '72px', fontWeight: 900, color: 'white', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '-4px', maxWidth: '900px' }}>
                  {title.length > 60 ? title.substring(0, 60) + '...' : title}
                </div>
                <div style={{ color: '#FF3366', fontSize: '22px', fontWeight: 700, textTransform: 'uppercase' }}>
                  SIGNAL_SOURCE: {author}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 80px 40px 80px' }}>
            <span style={{ fontSize: '10px', color: '#333333', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              PROTOCOL_V03.1 // BROADCAST_SYNC: ACTIVE
            </span>
            <span style={{ fontSize: '10px', color: '#333333', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              truth-app.vercel.app
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch {
    return new Response(`Failed to generate signal preview`, { status: 500 })
  }
}
