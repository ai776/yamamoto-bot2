import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, conversation_id } = req.body

  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const apiKey = process.env.DIFY_API_KEY
  const apiUrl = process.env.DIFY_API_URL || 'https://api.dify.ai/v1'

  if (!apiKey) {
    console.error('DIFY_API_KEY is not set in environment variables')
    return res.status(500).json({ error: 'API configuration error' })
  }

  try {
    // Dify APIへのリクエスト
    const response = await axios.post(
      `${apiUrl}/chat-messages`,
      {
        inputs: {},
        query: message,
        response_mode: 'blocking',
        conversation_id: conversation_id || undefined,
        user: 'user_' + Date.now() // ユーザー識別子
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    // レスポンスの形式を確認してデータを抽出
    const answer = response.data.answer || response.data.message || 'すみません、応答を生成できませんでした。'
    const responseConversationId = response.data.conversation_id

    res.status(200).json({
      answer: answer,
      conversation_id: responseConversationId
    })
  } catch (error: any) {
    console.error('Dify API Error:', error.response?.data || error.message)

    // エラーメッセージをより詳細に
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'APIキーが無効です。環境変数を確認してください。' })
    }

    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'APIエンドポイントが見つかりません。URLを確認してください。' })
    }

    res.status(500).json({
      error: 'チャットボットとの通信に失敗しました。',
      details: error.response?.data?.message || error.message
    })
  }
}
