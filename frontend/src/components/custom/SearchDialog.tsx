import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogOverlay
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Search } from "lucide-react"
import { useRouter } from '@tanstack/react-router'
import { Token } from '../../models/token'
import { Transaction } from '../../models/transactions'
import { formatNumber, timeAgo } from '../../utils/utils'

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchResults {
  tokens: Token[]
  transactions: Transaction[]
  loading: boolean
}

const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResults>({
    tokens: [],
    transactions: [],
    loading: false
  })

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Handle search
  useEffect(() => {
    const searchData = async () => {
      if (!searchTerm) {
        setResults({ tokens: [], transactions: [], loading: false })
        return
      }

      setResults(prev => ({ ...prev, loading: true }))

      try {
        // Search tokens
        const tokenResponse = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/token/search?q=${searchTerm}`)
        const tokenData = await tokenResponse.json()
        // console.log('tokenData', tokenData)

        // Search transactions
        const txResponse = await fetch(`${import.meta.env.PUBLIC_API_NEW}/api/transaction/search?q=${searchTerm}`)
        const txData = await txResponse.json()
        // console.log('txData', txData)
        setResults({
          tokens: tokenData.data || [],
          transactions: txData.data || [],
          loading: false
        })
      } catch (error) {
        console.error('Search error:', error)
        setResults({ tokens: [], transactions: [], loading: false })
      }
    }

    const debounceTimer = setTimeout(searchData, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleTokenClick = (token: Token) => {
    if (token.address) {
      router.navigate({ to: `/token/${token.address}` })
      onClose()
    }else if(token.type) {
      window.open(`https://suiscan.xyz/mainnet/coin/${token.type}/txs`, '_blank')
      onClose()
    }else {
      window.open(`https://www.coingecko.com/en/coins/${token.id}`, '_blank')
      onClose()
    }
    setSearchTerm('')
  }

  const handleTransactionClick = (tx: Transaction) => {
    // Navigate to transaction details or open in explorer
    window.open(`${tx.network == "Sonic" ? "https://testnet.sonicscan.org/tx/" : "https://scanv2-testnet.ancient8.gg/tx/"}${tx.transactionHash}`, '_blank')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-sm bg-black/10" />
      <DialogContent className="fixed top-20 left-1/2 -translate-x-1/2 translate-y-0 sm:max-w-3xl p-0 rounded-t-none border-t-0 bg-[#161B28]/80 border border-[#2D333B]/30">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="w-full pl-12 pr-4 py-6 bg-[#161B28] border-none text-white rounded-t-none text-sm focus:ring-1 focus:ring-[#2D3748] focus:outline-none"
            placeholder="Search for user address, token, transaction..."
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-[#0B0E17] p-4 max-h-[400px] overflow-y-auto">
          {results.loading ? (
            <div className="text-gray-400 text-sm text-center py-8">
              Searching...
            </div>
          ) : !searchTerm ? (
            <div className="text-gray-400 text-sm text-center py-8">
              Start typing to search...
            </div>
          ) : results.tokens.length === 0 && results.transactions.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-8">
              No results found
            </div>
          ) : (
            <div className="space-y-4">
              {results.tokens.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Tokens</h3>
                  <div className="space-y-2">
                    {results.tokens.map((token) => (
                      <div
                        key={token.address}
                        className="flex items-center justify-between space-x-3 p-2 hover:bg-[#1A202C] rounded-lg cursor-pointer"
                        onClick={() => handleTokenClick(token)}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={token.imageUrl || token.iconUrl || '/android-chrome-192x192.png'}
                            alt={token.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-medium text-white">{token.name}</div>
                            <div className="text-xs text-gray-400">{token.ticker}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatNumber(token.market_data?.current_price?.usd || token.tokenPrice || 0, 5)} USD
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.transactions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Transactions</h3>
                  <div className="space-y-2">
                    {results.transactions.map((tx) => (
                      <div
                        key={tx.transactionHash}
                        className="flex items-center justify-between p-2 hover:bg-[#1A202C] rounded-lg cursor-pointer"
                        onClick={() => handleTransactionClick(tx)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`text-xs font-medium px-2 py-1 rounded ${
                            tx.transactionType === 'BUY' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {tx.transactionType}
                          </div>
                          <div className="text-sm text-white">
                            {formatNumber(tx.amount)} {tx.network}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {timeAgo(new Date(tx.timestamp))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SearchDialog 