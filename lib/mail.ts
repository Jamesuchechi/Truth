import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const domain = process.env.NEXT_PUBLIC_APP_URL 
  ? process.env.NEXT_PUBLIC_APP_URL 
  : process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : "http://localhost:3000";

// --- Premium Template Wrapper ---
const wrapTemplate = ({
    title,
    message,
    actionLink,
    actionText,
    accentColor = "#FF3366", // Default Truth Red
    footerInfo = ""
}: {
    title: string,
    message: string,
    actionLink?: string,
    actionText?: string,
    accentColor?: string,
    footerInfo?: string
}) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;700;900&display=swap');
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #030303; font-family: 'Inter', sans-serif; color: #E0E0E0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030303; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0D0D0D; border: 2px solid #1F1F1F; box-shadow: 20px 20px 0px rgba(255, 51, 102, 0.05);">
                        <!-- Header Bar -->
                        <tr>
                            <td style="padding: 30px; border-bottom: 2px solid #1F1F1F; background-color: rgba(31, 31, 31, 0.2);">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                            <div style="font-family: 'Space Mono', monospace; font-size: 10px; color: ${accentColor}; letter-spacing: 0.3em; margin-bottom: 8px;">TRUTH_ENCRYPTION_PROTOCOL</div>
                                            <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.05em; text-transform: uppercase;">${title}</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Content Body -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <div style="font-size: 16px; line-height: 1.6; color: #B0B0B0; margin-bottom: 30px;">
                                    ${message}
                                </div>
                                
                                ${actionLink ? `
                                    <table border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td align="left">
                                                <a href="${actionLink}" style="display: inline-block; padding: 16px 32px; background-color: ${accentColor}; color: #000000; text-decoration: none; font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 4px solid ${accentColor}; box-shadow: 8px 8px 0px rgba(255,255,255,0.1); transition: all 0.3s ease;">
                                                    ${actionText}
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                ` : ''}
                            </td>
                        </tr>

                        <!-- Footer Trace -->
                        <tr>
                            <td style="padding: 30px; border-top: 1px solid #1F1F1F; background-color: rgba(0,0,0,0.3);">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style="font-family: 'Space Mono', monospace; font-size: 9px; color: #4A4A4A; line-height: 1.8; text-transform: uppercase;">
                                            <div>TECHNICAL_TRACE_LOG</div>
                                            <div>SOURCE_NODE: TRUTH_CORE_v3</div>
                                            <div>ENCRYPTION: AES-256-GCM</div>
                                            ${footerInfo ? `<div style="margin-top: 4px; color: #666;">METADATA: ${footerInfo}</div>` : ''}
                                            <div style="margin-top: 16px;">This signal is automated. Internal decryption required for manual response.</div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 24px; font-family: 'Space Mono', monospace; font-size: 10px; color: #2A2A2A; text-transform: uppercase; letter-spacing: 0.1em;">
                        &copy; 2026 TRUTH_SYSTEMS // ANONYMITY_IS_FREEDOM
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
`

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${domain}/auth/verify?token=${token}`

  await resend.emails.send({
    from: "TruTH <verification@resend.dev>",
    to: email,
    subject: "[VERIFICATION_REQUIRED] Confirm your TruTH account",
    html: wrapTemplate({
        title: "IDENTITY_VERIFY",
        message: "You have initiated an registration protocol for a TruTH encryption identity. Synchronization requires immediate confirmation of this email node.",
        actionLink: confirmLink,
        actionText: "INITIALIZE_SINK",
        accentColor: "#00BBF9" // Truth Blue
    })
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${domain}/auth/new-password?token=${token}`

  await resend.emails.send({
    from: "TruTH <security@resend.dev>",
    to: email,
    subject: "[ACCESS_RECOVERY] Reset your TruTH password",
    html: wrapTemplate({
        title: "ACCESS_RECOVERY",
        message: "A password modification request was detected for your terminal. Unauthorized attempts should be ignored and reported to core security.",
        actionLink: resetLink,
        actionText: "RECONFIGURE_DECRYPT",
        accentColor: "#00BBF9"
    })
  })
}

export async function sendTwoFactorTokenEmail(email: string, token: string) {
  await resend.emails.send({
    from: "TruTH <secure@resend.dev>",
    to: email,
    subject: "[SECURE_AUTH] Your 2FA Authentication Signal",
    html: wrapTemplate({
        title: "AUTH_SIGNAL",
        message: `A secondary authentication attempt requires manual injection of the following code into the primary terminal. Do not share this signal.`,
        accentColor: "#00F5D4", // Truth Green
        footerInfo: `SIGNAL_CODE: ${token}`,
        actionText: token, // Display the code large
        actionLink: "#" // No link needed for 2FA, but it styles the button
    })
  })
}

export async function sendInboxNotificationEmail(email: string) {
  const loginLink = `${domain}/inbox`
  
  await resend.emails.send({
    from: "TruTH <signal@resend.dev>",
    to: email,
    subject: "[SIGNAL_RECEIVED] New Encrypted Message Available",
    html: wrapTemplate({
        title: "SIGNAL_SYNC",
        message: "A new anonymous transmission pulse has been synchronized to your intelligence bank. Decryption is available for review in the primary inbox.",
        actionLink: loginLink,
        actionText: "DECRYPT_TRANSMISSION",
        accentColor: "#FF3366" // Truth Red
    })
  })
}
