import dns from 'node:dns'

try {
  dns.setDefaultResultOrder('ipv4first')
} catch {}

type SendEmailPayload = {
  toEmail: string
  toName?: string
  subject: string
  htmlContent: string
}

export async function sendBrevoEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
}: SendEmailPayload): Promise<{ success: boolean; messageId?: string; error?: string; simulated?: boolean }> {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  let senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || ''
  let senderName = process.env.BREVO_SENDER_NAME?.trim() || 'HS AgroFoods'

  // Clean sender email if formatted as "Name <email@domain.com>"
  const angleMatch = senderEmail.match(/<([^>]+)>/)
  if (angleMatch) {
    const extractedName = senderEmail.replace(/<[^>]+>/, '').trim()
    if (extractedName && (!process.env.BREVO_SENDER_NAME || process.env.BREVO_SENDER_NAME === 'HS AgroFoods')) {
      senderName = extractedName
    }
    senderEmail = angleMatch[1].trim()
  }

  // Dev fallback when keys are not configured yet
  if (!apiKey || !senderEmail) {
    console.warn('\n============================================================')
    console.warn('⚠️  [BREVO DEV FALLBACK] Brevo API Key or Sender Email is missing!')
    console.warn(`📩  To: ${toEmail} (${toName || 'Customer'})`)
    console.warn(`📌  Subject: ${subject}`)
    console.warn('💡  Add BREVO_API_KEY and BREVO_SENDER_EMAIL in .env.local to send live emails.')
    console.warn('============================================================\n')
    return { success: true, simulated: true }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail.split('@')[0],
          },
        ],
        subject,
        htmlContent,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Brevo API Error]', data)
      return {
        success: false,
        error: data.message || `Brevo returned status ${response.status}`,
      }
    }

    return {
      success: true,
      messageId: data.messageId,
    }
  } catch (error: any) {
    console.error('[Brevo Network Error]', error)
    return {
      success: false,
      error: error.message || 'Failed to connect to Brevo email service',
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Shared email layout
// Plain solid colours + table layout only, so it renders the same in
// Gmail, Outlook and Apple Mail. No emoji, no gradients.
// ─────────────────────────────────────────────────────────────
const SITE_URL = 'https://www.hsagrofoods.com'
const SUPPORT_EMAIL = 'Hs.foodofficial@gmail.com'
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

// User-supplied text (names, addresses, product names) must never reach the HTML raw
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const inr = (n: number | string) => `&#8377;${Number(n).toLocaleString('en-IN')}`

function emailHeading(text: string) {
  return `<h1 style="margin: 0 0 14px 0; font-size: 22px; line-height: 1.3; font-weight: 700; color: #14361F;">${text}</h1>`
}

function emailParagraph(html: string, opts: { muted?: boolean; mb?: number } = {}) {
  const color = opts.muted ? '#6B6B6B' : '#444444'
  const size = opts.muted ? 13 : 15
  return `<p style="margin: 0 0 ${opts.mb ?? 12}px 0; font-size: ${size}px; line-height: 1.6; color: ${color};">${html}</p>`
}

// Bulletproof button: a table cell with a solid background works in Outlook too
function emailButton(label: string, href: string) {
  return `
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 24px auto;">
      <tr>
        <td align="center" bgcolor="#E07B0C" style="border-radius: 6px; background-color: #E07B0C;">
          <a href="${esc(href)}" target="_blank" style="display: inline-block; padding: 13px 32px; font-family: ${FONT}; font-size: 15px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 6px;">${label}</a>
        </td>
      </tr>
    </table>`
}

function emailLayout({ subject, preheader, content }: { subject: string; preheader: string; content: string }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${esc(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F1EC; font-family: ${FONT}; color: #2B2B2B;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">${esc(preheader)}</div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F1EC;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #E7E1D8; border-top: 4px solid #E07B0C; border-radius: 8px;">

          <!-- Brand -->
          <tr>
            <td align="center" style="padding: 28px 32px 8px 32px;">
              <img src="${SITE_URL}/images/logo.png" width="104" height="104" alt="HS AgroFoods" style="display: block; width: 104px; height: 104px; margin: 0 auto 8px auto; border: 0; outline: none;">
              <div style="font-size: 20px; font-weight: 700; color: #14361F; letter-spacing: 0.3px;">HS AgroFoods</div>
              <div style="font-size: 12px; color: #8C7567; margin-top: 3px;">Pure Spices &amp; Dehydrated Powders</div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px 32px 28px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px 32px 24px 32px; background-color: #FAF7F2; border-top: 1px solid #E7E1D8; border-radius: 0 0 8px 8px;">
              <div style="font-size: 12px; line-height: 1.7; color: #8C7567;">
                Need help? Write to <a href="mailto:${SUPPORT_EMAIL}" style="color: #B8610A; text-decoration: none;">${SUPPORT_EMAIL}</a><br>
                <a href="${SITE_URL}" style="color: #B8610A; text-decoration: none;">www.hsagrofoods.com</a> &nbsp;&middot;&nbsp; Hyderabad, Telangana, India
              </div>
              <div style="font-size: 11px; color: #A89B90; margin-top: 10px;">&copy; ${new Date().getFullYear()} HS AgroFoods. All rights reserved.</div>
            </td>
          </tr>
        </table>
        <div style="max-width: 560px; font-size: 11px; line-height: 1.5; color: #A89B90; text-align: center; padding-top: 14px;">
          This is an automated message about your HS AgroFoods account or order. Please do not reply to this email.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// ─────────────────────────────────────────────────────────────
// OTP emails (signup + login)
// ─────────────────────────────────────────────────────────────
// The code is ONE text run (not one box per digit) so it can be selected and copied in one go.
function buildOtpEmailHtml({
  subject,
  name,
  heading,
  intro,
  otp,
  ignoreNote,
}: {
  subject: string
  name: string
  heading: string
  intro: string
  otp: string
  ignoreNote: string
}) {
  const content = `
    ${emailHeading(heading)}
    ${emailParagraph(`Hi ${esc(name) || 'there'},`)}
    ${emailParagraph(intro, { mb: 0 })}

    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="margin-top: 24px; background-color: #FAF7F2; border: 1px solid #E7E1D8; border-radius: 8px;">
      <tr>
        <td align="center" style="padding: 20px 12px;">
          <div style="font-size: 12px; font-weight: 600; color: #8C7567; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Your verification code</div>
          <div style="font-size: 36px; line-height: 1.1; font-weight: 700; color: #14361F; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; padding-left: 10px;">${esc(otp)}</div>
        </td>
      </tr>
    </table>
    <p style="margin: 14px 0 20px 0; font-size: 13px; text-align: center; color: #6B6B6B;">This code expires in <strong style="color: #2B2B2B;">10 minutes</strong> and can be used once.</p>

    ${emailParagraph('<strong style="color: #2B2B2B;">Keep this code private.</strong> HS AgroFoods will never ask for it over a call, WhatsApp or SMS.', { muted: true, mb: 10 })}
    ${emailParagraph(ignoreNote, { muted: true, mb: 0 })}
  `

  return emailLayout({
    subject,
    preheader: `Your HS AgroFoods code is ${otp}. It expires in 10 minutes.`,
    content,
  })
}

/**
 * 1. Send Account Signup Verification OTP
 */
export async function sendSignupOtpEmail({
  email,
  name,
  otp,
}: {
  email: string
  name: string
  otp: string
}) {
  const subject = `${otp} is your HS AgroFoods verification code`

  const htmlContent = buildOtpEmailHtml({
    subject,
    name,
    heading: 'Verify Your Email',
    intro:
      'Thank you for choosing HS AgroFoods. Enter the following 6-digit code to complete your registration and activate your account:',
    otp,
    ignoreNote:
      'If you did not try to create an account, you can safely ignore this email. No account will be created without this code.',
  })

  return sendBrevoEmail({
    toEmail: email,
    toName: name,
    subject,
    htmlContent,
  })
}

/**
 * 1b. Send Login OTP
 */
export async function sendLoginOtpEmail({
  email,
  name,
  otp,
}: {
  email: string
  name: string
  otp: string
}) {
  const subject = `${otp} is your HS AgroFoods login code`

  const htmlContent = buildOtpEmailHtml({
    subject,
    name,
    heading: 'Your Login Code',
    intro: 'Use the following 6-digit code to sign in to your HS AgroFoods account:',
    otp,
    ignoreNote:
      'If you did not try to sign in, you can safely ignore this email. Your account stays secure and no one can log in without this code.',
  })

  return sendBrevoEmail({
    toEmail: email,
    toName: name,
    subject,
    htmlContent,
  })
}

/**
 * 2. Send Password Reset Link Email
 */
export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: {
  email: string
  name?: string
  resetUrl: string
}) {
  const subject = 'Reset your HS AgroFoods password'

  const content = `
    ${emailHeading('Reset Your Password')}
    ${emailParagraph(`Hi ${esc(name) || 'there'},`)}
    ${emailParagraph('We received a request to reset the password for your HS AgroFoods account. Click the button below to choose a new one.', { mb: 0 })}

    ${emailButton('Reset Password', resetUrl)}

    <p style="margin: 0 0 20px 0; font-size: 13px; text-align: center; color: #6B6B6B;">This link expires in <strong style="color: #2B2B2B;">15 minutes</strong> and can be used once.</p>

    ${emailParagraph('If the button does not work, copy and paste this link into your browser:', { muted: true, mb: 6 })}
    <div style="word-break: break-all; font-size: 12px; line-height: 1.5; background-color: #FAF7F2; border: 1px solid #E7E1D8; border-radius: 6px; padding: 10px 12px; margin-bottom: 20px;">
      <a href="${esc(resetUrl)}" style="color: #B8610A; text-decoration: underline;">${esc(resetUrl)}</a>
    </div>

    ${emailParagraph('If you did not request a password reset, you can safely ignore this email. Your password will not change.', { muted: true, mb: 0 })}
  `

  const htmlContent = emailLayout({
    subject,
    preheader: 'Use this link to reset your HS AgroFoods password. It expires in 15 minutes.',
    content,
  })

  return sendBrevoEmail({
    toEmail: email,
    toName: name,
    subject,
    htmlContent,
  })
}

/**
 * 3. Send Order Confirmation / Invoice Receipt Email
 */
export type OrderItemSummary = {
  product_name: string
  variant_name?: string | null
  quantity: number
  price_at_purchase: number
  line_total: number
}

export type OrderEmailData = {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingAddress: {
    address_line_1: string
    address_line_2?: string | null
    city: string
    state: string
    postal_code: string
    country?: string
  }
  items: OrderItemSummary[]
  subtotal: number
  shippingCost: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: 'paid' | 'pending'
  orderDate?: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const isPaidOnline = data.paymentStatus === 'paid'
  const subject = `Order confirmed: #${data.orderNumber} - HS AgroFoods`
  const formattedDate =
    data.orderDate ||
    new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const fullAddress = [
    esc(data.shippingAddress.address_line_1),
    esc(data.shippingAddress.address_line_2),
    `${esc(data.shippingAddress.city)}, ${esc(data.shippingAddress.state)} - ${esc(data.shippingAddress.postal_code)}`,
    esc(data.shippingAddress.country || 'India'),
  ]
    .filter(Boolean)
    .join('<br>')

  const cell = 'padding: 12px 8px; font-size: 13px; border-bottom: 1px solid #EFE9E0; vertical-align: top;'
  const itemRowsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="${cell} color: #2B2B2B;">
          <strong>${esc(item.product_name)}</strong>
          ${item.variant_name ? `<br><span style="font-size: 12px; color: #8C7567;">${esc(item.variant_name)}</span>` : ''}
        </td>
        <td align="center" style="${cell} color: #444444;">${Number(item.quantity)}</td>
        <td align="right" style="${cell} color: #444444;">${inr(item.price_at_purchase)}</td>
        <td align="right" style="${cell} color: #2B2B2B; font-weight: 600;">${inr(item.line_total)}</td>
      </tr>`
    )
    .join('')

  const th = 'padding: 8px; font-size: 11px; font-weight: 700; color: #8C7567; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 2px solid #E7E1D8;'
  const totalRow = (label: string, value: string, strong = false) => `
      <tr>
        <td align="right" style="padding: 5px 8px; font-size: ${strong ? 15 : 13}px; ${strong ? 'font-weight: 700; color: #14361F;' : 'color: #6B6B6B;'}">${label}</td>
        <td align="right" width="110" style="padding: 5px 8px; font-size: ${strong ? 15 : 13}px; ${strong ? 'font-weight: 700; color: #14361F;' : 'color: #2B2B2B;'}">${value}</td>
      </tr>`

  const paymentLabel = isPaidOnline ? 'Paid online (Razorpay)' : 'Cash on delivery'
  const paymentNote = isPaidOnline
    ? 'Payment received. Thank you.'
    : `Please keep ${inr(data.totalAmount)} ready to pay at delivery.`

  const metaRow = (label: string, value: string) => `
      <tr>
        <td style="padding: 5px 0; font-size: 13px; color: #8C7567; width: 110px;">${label}</td>
        <td style="padding: 5px 0; font-size: 13px; color: #2B2B2B; font-weight: 600;">${value}</td>
      </tr>`

  const content = `
    ${emailHeading('Thank you for your order')}
    ${emailParagraph(`Hi ${esc(data.customerName) || 'there'},`)}
    ${emailParagraph('We have received your order and our team is packing it. We will email you again once it ships.', { mb: 20 })}

    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="background-color: #FAF7F2; border: 1px solid #E7E1D8; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px 18px;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
            ${metaRow('Order number', `#${esc(data.orderNumber)}`)}
            ${metaRow('Order date', esc(formattedDate))}
            ${metaRow('Payment', paymentLabel)}
          </table>
        </td>
      </tr>
    </table>

    <div style="font-size: 12px; font-weight: 700; color: #14361F; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">Order summary</div>
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th align="left" style="${th}">Item</th>
          <th align="center" style="${th}">Qty</th>
          <th align="right" style="${th}">Price</th>
          <th align="right" style="${th}">Total</th>
        </tr>
      </thead>
      <tbody>${itemRowsHtml}</tbody>
    </table>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 8px;">
      ${totalRow('Subtotal', inr(data.subtotal))}
      ${totalRow('Shipping', data.shippingCost === 0 ? 'Free' : inr(data.shippingCost))}
      <tr><td colspan="2" style="padding: 4px 8px 0 8px;"><div style="border-top: 1px solid #E7E1D8; height: 1px; line-height: 1px; font-size: 1px;">&nbsp;</div></td></tr>
      ${totalRow('Total', inr(data.totalAmount), true)}
    </table>
    <p style="margin: 6px 8px 0 8px; font-size: 12px; text-align: right; color: #8C7567;">${paymentNote}</p>

    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="margin-top: 24px; border: 1px solid #E7E1D8; border-radius: 8px;">
      <tr>
        <td style="padding: 14px 18px;">
          <div style="font-size: 12px; font-weight: 700; color: #14361F; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">Delivery address</div>
          <div style="font-size: 13px; line-height: 1.6; color: #444444;">
            <strong style="color: #2B2B2B;">${esc(data.customerName)}</strong><br>
            ${fullAddress}
            ${data.customerPhone ? `<br>Phone: ${esc(data.customerPhone)}` : ''}
          </div>
        </td>
      </tr>
    </table>

    ${emailButton('View My Order', `${SITE_URL}/account/orders`)}

    ${emailParagraph('Orders are usually dispatched within 24 to 48 hours. You can track the delivery any time from My Orders on our website.', { muted: true, mb: 0 })}
  `

  const htmlContent = emailLayout({
    subject,
    preheader: `Order #${data.orderNumber} confirmed. Total ${Number(data.totalAmount).toLocaleString('en-IN')} rupees.`,
    content,
  })

  return sendBrevoEmail({
    toEmail: data.customerEmail,
    toName: data.customerName,
    subject,
    htmlContent,
  })
}
