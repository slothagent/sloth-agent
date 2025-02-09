'use client'

import { useState, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import TokenForm from '@/components/TokenForm'
import { tokenComponentTool } from '@/ai/token-component-tool'
import { ViewFrame } from '@/components/ViewFrame'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const TOKEN_CREATION_TEMPLATES = [
  {
    title: "Basic Token",
    template: `Create a basic token with:
- Name: MyToken
- Symbol: MTK
- Initial Supply: 100,000,000
- Description: A simple cryptocurrency token
- Initial Buy Value: 0.001 ETH
- Token Image: https://example.com/mytoken-logo.png
- Social Media:
  * Telegram: https://t.me/mytoken
  * Twitter: https://twitter.com/mytoken
  * Facebook: https://facebook.com/mytoken`
  },
  {
    title: "Social Token",
    template: `Create a social media focused token with:
- Name: SocialCoin
- Symbol: SOC
- Initial Supply: 1,000,000,000
- Description: A community-driven social token for content creators
- Initial Buy Value: 0.0005 ETH
- Token Image: https://example.com/socialcoin-logo.png
- Social Media Integration:
  * Active Telegram community: https://t.me/socialcoin
  * Twitter updates: https://twitter.com/socialcoin
  * Facebook page: https://facebook.com/socialcoin
- Community Features`
  },
  {
    title: "Gaming Token",
    template: `Create a gaming token with:
- Name: GameCoin
- Symbol: GAME
- Initial Supply: 50,000,000
- Description: In-game currency for rewards and transactions
- Initial Buy Value: 0.002 ETH
- Token Image: https://example.com/gamecoin-logo.png
- Social Media:
  * Gaming community on Telegram: https://t.me/gamecoin
  * Twitter announcements: https://twitter.com/gamecoin
  * Facebook gaming group: https://facebook.com/gamecoin
- In-game Currency Features
- Player Rewards System`
  }
]

// Thêm function để format code
const formatCodeBlock = (content: string) => {
  if (content.includes('```jsx')) {
    const parts = content.split('```jsx')
    const codeParts = parts[1].split('```')
    return {
      hasCode: true,
      explanation: parts[0].trim(),
      code: codeParts[0].trim()
    }
  }
  return { hasCode: false, content }
}

export default function ChatPage() {
  const [showTokenForm, setShowTokenForm] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState<string>('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Add search logic here if needed
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
     
      const componentCode = await tokenComponentTool({
        prompt: input
      })

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Sure! Let's create a token component based on your requirements:

\`\`\`jsx
${componentCode}
\`\`\`

I've generated a React component for token creation. You can see the live preview below.`
      }])

    } catch (error) {
      console.error('Failed to generate component:', error)
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error generating the component. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header handleSearch={handleSearch} search={search} setSearch={setSearch} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-800 px-4">
              <div className="w-full max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  <Bot size={64} className="mb-8 text-blue-600" />
                  <h2 className="text-3xl font-bold mb-4">Token Creation Assistant</h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Hi! I can help you create your token. Try these templates:
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {TOKEN_CREATION_TEMPLATES.map((template) => (
                    <button
                      key={template.title}
                      onClick={() => {
                        setInput(template.template)
                        handleSubmit(new Event('submit') as any)
                      }}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 
                        transition-colors text-left shadow-sm hover:shadow-md"
                    >
                      <h3 className="font-semibold mb-2">{template.title}</h3>
                      <p className="text-sm text-gray-600">
                        {template.template.split('\n')[0]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`px-4 py-6 ${
                    message.role === 'assistant' ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="max-w-3xl mx-auto flex space-x-6 px-4">
                    {message.role === 'assistant' ? (
                      <div className="shrink-0">
                        <Bot className="w-6 h-6 text-blue-600" />
                      </div>
                    ) : (
                      <div className="shrink-0">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      {message.role === 'assistant' ? (
                        <>
                          {(() => {
                            const formatted = formatCodeBlock(message.content)
                            if (formatted.hasCode) {
                              return (
                                <>
                                  <div className="text-gray-800 whitespace-pre-wrap mb-4">
                                    {formatted.explanation}
                                  </div>
                                  <div className="mt-4 p-4 border rounded-lg bg-white">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Component Preview:</h3>
                                    <div className="border-t pt-4">
                                      <ViewFrame code={formatted.code || ''} />
                                    </div>
                                  </div>
                                </>
                              )
                            }
                            return (
                              <div className="text-gray-800 whitespace-pre-wrap">
                                {message.content}
                              </div>
                            )
                          })()}
                        </>
                      ) : (
                        <div className="text-gray-800 whitespace-pre-wrap">
                          {message.content}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {showTokenForm && (
                <div className="px-4 py-6 bg-white">
                  <div className="max-w-3xl mx-auto">
                    <TokenForm />
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="px-4 py-6 bg-gray-50">
                  <div className="max-w-3xl mx-auto flex space-x-6 px-4">
                    <div className="shrink-0">
                      <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center bg-white border-t p-4">
        <div className="max-w-5xl w-[880px] mx-auto px-4">
          <form
            onSubmit={handleSubmit}
            className="relative bg-white rounded-lg shadow-sm 
              border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about creating your token..."
              className="w-full bg-transparent text-gray-800 p-4 pr-12 focus:outline-none rounded-lg"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 
                hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-2">
            Token Creation Assistant may produce inaccurate information. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}
