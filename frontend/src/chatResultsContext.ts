import { createContext, useContext } from 'react'

// Carries the product matches from a chat search to the Products page so the
// page can update itself to show exactly what the agent found.
export interface ChatResult {
  ids: string[] // product_ids the agent returned, in order
  query: string // the customer's message, for the "showing results for…" banner
}

export interface ChatResultsControls {
  result: ChatResult | null
  showResults: (ids: string[], query: string) => void
  clear: () => void
}

export const ChatResultsContext = createContext<ChatResultsControls>({
  result: null,
  showResults: () => {},
  clear: () => {},
})

export const useChatResults = () => useContext(ChatResultsContext)
