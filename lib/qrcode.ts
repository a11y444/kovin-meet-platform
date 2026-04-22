import QRCode from "qrcode"

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: "M",
      type: "png",
      width: 300,
      margin: 2,
    })
    return buffer
  } catch (error) {
    console.error("Error generating QR code buffer:", error)
    throw new Error("Failed to generate QR code")
  }
}

export function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) {
      result += "-"
    }
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateMeetingCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz"
  const parts = []
  for (let i = 0; i < 3; i++) {
    let part = ""
    for (let j = 0; j < 4; j++) {
      part += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    parts.push(part)
  }
  return parts.join("-")
}
