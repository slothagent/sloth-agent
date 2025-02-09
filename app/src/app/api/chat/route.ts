import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

function parseTokenInfoFromResponse(response: string) {
  const tokenUpdates: Record<string, string | number> = {}
  
  // Tìm thông tin token từ phản hồi
  const nameMatch = response.match(/name:\s*["']([^"']+)["']/)
  const symbolMatch = response.match(/symbol:\s*["']([^"']+)["']/)
  const descriptionMatch = response.match(/description:\s*["']([^"']+)["']/)
  const imageMatch = response.match(/image:\s*["']([^"']+)["']/)
  const initialBuyValueMatch = response.match(/initialBuyValue:\s*["']([^"']+)["']/)
  const facebookMatch = response.match(/facebook:\s*["']([^"']+)["']/)
  const telegramMatch = response.match(/telegram:\s*["']([^"']+)["']/)
  const twitterMatch = response.match(/twitter:\s*["']([^"']+)["']/)

  // Cập nhật object nếu tìm thấy thông tin
  if (nameMatch) tokenUpdates.name = nameMatch[1]
  if (symbolMatch) tokenUpdates.symbol = symbolMatch[1]
  if (descriptionMatch) tokenUpdates.description = descriptionMatch[1]
  if (imageMatch) tokenUpdates.image = imageMatch[1]
  if (initialBuyValueMatch) tokenUpdates.initialBuyValue = initialBuyValueMatch[1]
  if (facebookMatch) tokenUpdates.facebook = facebookMatch[1]
  if (telegramMatch) tokenUpdates.telegram = telegramMatch[1]
  if (twitterMatch) tokenUpdates.twitter = twitterMatch[1]

  return tokenUpdates
}

export async function POST(req: Request) {
  try {
    const { message, tokenData } = await req.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert token creation assistant. Your role is to help users create tokens on the blockchain by:

          1. Guiding them through the token creation process step by step
          2. Explaining technical concepts in simple terms
          3. Collecting and validating the following required information:
             - Token name: A unique and memorable name for your token
             - Token symbol: 2-6 characters, usually uppercase (e.g., BTC, ETH)
             - Description: Clear explanation of your token's purpose and features
             - Initial Buy Value: The starting price for your token (e.g., 0.001 ETH)
             - Initial Supply: 100000000000 (for deploy) or 10000000 (for verify)
             - Token Image URL: A public URL to your token's logo/image (e.g., https://example.com/token-logo.png)
             - Social Media Links:
               * Facebook: Official Facebook page URL
               * Telegram: Community group or channel URL
               * Twitter: Official Twitter profile URL

          Current token data: ${JSON.stringify(tokenData)}
          
          If any of these fields are missing or invalid, ask for them specifically.
          For social media links, remind users that these help build trust and community.
          For initial buy value, help users understand pricing strategy.
          For token image, suggest using a professional logo hosted on a reliable platform.
          
          Parse user inputs and update token parameters when provided.
          Validate inputs and provide feedback on missing or invalid information.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    })

    const aiResponse = completion.choices[0].message.content
    const tokenUpdates = parseTokenInfoFromResponse(aiResponse || '')
    
    return NextResponse.json({
      message: aiResponse,
      tokenData: tokenUpdates,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 