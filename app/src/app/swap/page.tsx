'use client'

import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TokenSelectModal, Token, TokenIcon } from "@/components/TokenSelectModal"
import { useState } from "react"

const SwapPage = () => {
  const [sellAmount, setSellAmount] = useState<string>('')
  const [buyAmount, setBuyAmount] = useState<string>('')
  const [isSelectingToken, setIsSelectingToken] = useState(false)
  const [selectingTokenType, setSelectingTokenType] = useState<'token0' | 'token1'>('token0')
  const [selectedTokens, setSelectedTokens] = useState<{
    token0?: Token
    token1?: Token
  }>({
    token0: {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x4200000000000000000000000000000000000006',
      logoURI: '/assets/tokens/eth.png',
    }
  })

  const handleOpenTokenSelect = (tokenType: 'token0' | 'token1') => {
    setSelectingTokenType(tokenType)
    setIsSelectingToken(true)
  }

  const handleTokenSelect = (token: Token) => {
    setSelectedTokens(prev => ({
      ...prev,
      [selectingTokenType]: token
    }))
  }

  const handleAmountChange = (value: string, type: 'sell' | 'buy') => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '')
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.')
    const formattedValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleanValue

    if (type === 'sell') {
      setSellAmount(formattedValue)
    } else {
      setBuyAmount(formattedValue)
    }
  }

  return (
    <>
      <Header />
      <div className="container max-w-[480px] mx-auto pt-10">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-medium mb-2">Swap anytime,</h1>
          <h1 className="text-6xl font-medium">anywhere.</h1>
        </div>

        <Card className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Sell Section */}
          <div className="p-5 bg-gray-50">
            <label className="text-sm text-gray-500 mb-1.5 block">Sell</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={sellAmount}
                  onChange={(e) => handleAmountChange(e.target.value, 'sell')}
                  className="w-full text-4xl font-normal bg-transparent outline-none placeholder:text-gray-300"
                />
                <div className="text-sm text-gray-500 mt-0.5">${sellAmount ? '0.00' : '0'}</div>
              </div>
              <Button 
                variant="ghost"
                className="h-10 flex items-center gap-2 hover:bg-gray-100 rounded-full px-3"
                onClick={() => handleOpenTokenSelect('token0')}
              >
                {selectedTokens.token0 && (
                  <>
                    <TokenIcon token={selectedTokens.token0} />
                    <span className="font-medium">{selectedTokens.token0.symbol}</span>
                    <span className="text-gray-400">▼</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Swap Direction Arrow */}
          <div className="flex justify-center -my-3 relative z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-white border shadow-sm hover:bg-gray-50"
            >
              ↓
            </Button>
          </div>

          {/* Buy Section */}
          <div className="p-5 bg-gray-50">
            <label className="text-sm text-gray-500 mb-1.5 block">Buy</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={buyAmount}
                  onChange={(e) => handleAmountChange(e.target.value, 'buy')}
                  className="w-full text-4xl font-normal bg-transparent outline-none placeholder:text-gray-300"
                />
              </div>
              <Button 
                variant="ghost"
                className="h-10 flex items-center gap-2 bg-pink-500 text-white hover:bg-pink-600 rounded-full px-4"
                onClick={() => handleOpenTokenSelect('token1')}
              >
                {selectedTokens.token1 ? (
                  <>
                    <TokenIcon token={selectedTokens.token1} />
                    <span className="font-medium">{selectedTokens.token1.symbol}</span>
                    <span>▼</span>
                  </>
                ) : (
                  <>
                    <span>Select token</span>
                    <span>▼</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Swap Button */}
          <div className="p-4">
            <Button 
              className="w-full bg-pink-500 hover:bg-pink-600 text-white h-14 text-lg font-medium rounded-2xl"
            >
              Get started
            </Button>
          </div>
        </Card>
      </div>

      <TokenSelectModal
        isOpen={isSelectingToken}
        onClose={() => setIsSelectingToken(false)}
        onSelect={handleTokenSelect}
        selectedTokens={selectedTokens}
        selectingToken={selectingTokenType}
      />
    </>
  )
}

export default SwapPage