import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, Twitter, Facebook, User } from 'lucide-react'

// ボットタイプの定義
export type BotType = 'yamamoto' | 'x' | 'facebook' | 'profile'

interface Bot {
  id: BotType
  name: string
  icon: React.ReactNode
  description: string
  placeholder: string
  apiEndpoint: string
}

// 利用可能なボット一覧
const AVAILABLE_BOTS: Bot[] = [
  {
    id: 'yamamoto',
    name: '山本さんボット',
    icon: <MessageCircle className="w-6 h-6" />,
    description: 'AIチャットボット',
    placeholder: 'メッセージを入力してください...',
    apiEndpoint: '/api/multi-bot/yamamoto'
  },
  {
    id: 'x',
    name: 'X投稿',
    icon: <Twitter className="w-6 h-6" />,
    description: 'X（旧Twitter）投稿文作成',
    placeholder: '投稿したい内容を入力してください...',
    apiEndpoint: '/api/multi-bot/x'
  },
  {
    id: 'facebook',
    name: 'Facebook投稿',
    icon: <Facebook className="w-6 h-6" />,
    description: 'Facebook投稿文作成',
    placeholder: '投稿したい内容を入力してください...',
    apiEndpoint: '/api/multi-bot/facebook'
  },
  {
    id: 'profile',
    name: '自己プロフィール',
    icon: <User className="w-6 h-6" />,
    description: '自己紹介文作成',
    placeholder: 'プロフィールに含めたい要素を入力してください...',
    apiEndpoint: '/api/multi-bot/profile'
  }
]

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  botType: BotType
}

export default function MultiBotSelector() {
  const [selectedBot, setSelectedBot] = useState<BotType>('yamamoto')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const fullTextRef = useRef('')
  const displayIndexRef = useRef(0)

  // ユーザーIDの初期化（メモリ機能用）
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('userId', newUserId)
      setUserId(newUserId)
    } else {
      setUserId(storedUserId)
    }
  }, [])

  // ボット切り替え時の処理
  useEffect(() => {
    // ボットごとに異なるconversation_idを管理
    const botConversationKey = `conversationId_${selectedBot}`
    const storedConversationId = sessionStorage.getItem(botConversationKey)
    setConversationId(storedConversationId)
  }, [selectedBot])

  // 現在選択されているボットの情報を取得
  const currentBot = AVAILABLE_BOTS.find(bot => bot.id === selectedBot)!

  // スクロール制御
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, displayedText])

  // テキストアニメーション
  const animateText = useCallback(() => {
    if (displayIndexRef.current < fullTextRef.current.length) {
      const batchSize = Math.max(1, Math.floor(fullTextRef.current.length / 100))
      const nextIndex = Math.min(
        displayIndexRef.current + batchSize,
        fullTextRef.current.length
      )
      
      setDisplayedText(fullTextRef.current.slice(0, nextIndex))
      displayIndexRef.current = nextIndex
      
      animationFrameRef.current = requestAnimationFrame(animateText)
    } else {
      setIsStreaming(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [])

  // メッセージ送信処理
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      botType: selectedBot
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsStreaming(true)
    fullTextRef.current = ''
    displayIndexRef.current = 0
    setDisplayedText('')

    // 新しいAbortControllerを作成
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(currentBot.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: conversationId,
          user: userId,
          botType: selectedBot
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              continue
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.event === 'message') {
                fullTextRef.current += parsed.answer || ''
                
                if (!animationFrameRef.current) {
                  animationFrameRef.current = requestAnimationFrame(animateText)
                }
              } else if (parsed.event === 'message_end') {
                // conversation_idを保存（ボットごとに）
                if (parsed.conversation_id) {
                  const botConversationKey = `conversationId_${selectedBot}`
                  sessionStorage.setItem(botConversationKey, parsed.conversation_id)
                  setConversationId(parsed.conversation_id)
                }
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }

      // 最終的なメッセージを追加
      if (fullTextRef.current) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: fullTextRef.current,
          timestamp: new Date(),
          botType: selectedBot
        }
        setMessages(prev => [...prev, assistantMessage])
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled')
      } else {
        console.error('Error:', error)
        const errorMessage: Message = {
          role: 'assistant',
          content: 'エラーが発生しました。もう一度お試しください。',
          timestamp: new Date(),
          botType: selectedBot
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setDisplayedText('')
      fullTextRef.current = ''
      displayIndexRef.current = 0
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }

  // 会話リセット
  const resetConversation = () => {
    const botConversationKey = `conversationId_${selectedBot}`
    sessionStorage.removeItem(botConversationKey)
    setConversationId(null)
    setMessages([])
  }

  // 現在のボットのメッセージのみをフィルタリング
  const filteredMessages = messages.filter(msg => msg.botType === selectedBot)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー：ボット選択 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">専門ボットを選択</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_BOTS.map((bot) => (
              <button
                key={bot.id}
                onClick={() => setSelectedBot(bot.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedBot === bot.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`${
                    selectedBot === bot.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {bot.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {bot.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {bot.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* チャットエリア */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* メッセージ表示エリア */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredMessages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <div className="mb-4">{currentBot.icon}</div>
                <p className="text-lg font-medium">{currentBot.name}へようこそ</p>
                <p className="text-sm mt-2">{currentBot.description}</p>
              </div>
            )}
            
            {filteredMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-2xl px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isStreaming && (
              <div className="flex justify-start">
                <div className="max-w-2xl px-4 py-2 rounded-lg bg-white border border-gray-200">
                  <p className="whitespace-pre-wrap text-gray-800">{displayedText}</p>
                  {displayedText.length === 0 && (
                    <span className="inline-block animate-pulse">●●●</span>
                  )}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="border-t bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={currentBot.placeholder}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '送信中...' : '送信'}
                </button>
                <button
                  onClick={resetConversation}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  title="会話をリセット"
                >
                  リセット
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
