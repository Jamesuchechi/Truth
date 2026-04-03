import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Dynamic parameters
    const title = searchParams.get('title') || 'TRUTH_SIGNAL'
    const author = searchParams.get('author') || 'ANONYMOUS_NODE'
    const type = searchParams.get('type') || 'DECRYPTED_TRANSMISSION'

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
            backgroundImage: 'radial-gradient(circle at 25px 25px, #2A2A2A 2%, transparent 0%), radial-gradient(circle at 75px 75px, #2A2A2A 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            padding: '80px',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20px', backgroundColor: '#FF3366' }} />
          
          <div style={{ display: 'flex', marginBottom: '40px', gap: '20px', alignItems: 'center' }}>
            <div style={{ padding: '8px 16px', backgroundColor: '#FF3366', color: '#0A0A0A', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '4px' }}>
              PROTOCOL_SECURE
            </div>
            <div style={{ color: '#888888', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
              {type}
            </div>
          </div>

          <div
            style={{
              fontSize: '80px',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '40px',
              maxWidth: '900px',
              textTransform: 'uppercase',
              letterSpacing: '-4px',
            }}
          >
            {title.length > 80 ? title.substring(0, 80) + '...' : title}
          </div>

          <div style={{ display: 'flex', width: '100%', justifySelf: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#FF3366', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                SIGNAL_SOURCE: {author}
              </div>
              <div style={{ color: '#555555', fontSize: '18px', textTransform: 'uppercase' }}>
                DECRYPTION_COMPLETED_SUCCESSFULLY
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '60px', height: '60px', border: '5px solid #FF3366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '30px', height: '30px', backgroundColor: '#FF3366' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', letterSpacing: '-2px' }}>TRUTH</span>
                    <span style={{ color: '#FF3366', fontSize: '10px', letterSpacing: '4px' }}>OS_PROTOCOL</span>
                </div>
            </div>
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
