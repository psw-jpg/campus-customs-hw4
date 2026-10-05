import { createContext, useContext } from 'react'

// Lets any page open the floating chat, optionally about a specific product.
export interface ChatControls {
  openChat: (productId?: string, productName?: string) => void
}

export const ChatContext = createContext<ChatControls>({ openChat: () => {} })

export const useChat = () => useContext(ChatContext)
