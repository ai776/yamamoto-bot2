import React, { useState, useEffect } from 'react'
import { X, Save, RotateCcw, Sparkles } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  botType: string
  onSave: (prompt: string) => void
}

// プリセットプロンプト
const PRESET_PROMPTS = {
  yamamoto: {
    name: 'デフォルト',
    prompt: 'あなたは親切で知識豊富なAIアシスタントです。ユーザーの質問に対して、正確で役立つ情報を提供してください。'
  },
  professional: {
    name: 'プロフェッショナル',
    prompt: 'あなたはビジネスの専門家です。フォーマルで専門的な口調で、ビジネスに関する質問に答えてください。敬語を使い、具体的なアドバイスを提供してください。'
  },
  friendly: {
    name: 'フレンドリー',
    prompt: 'あなたは親しみやすい友人のようなアシスタントです。カジュアルな口調で、絵文字も使いながら楽しく会話してください。😊'
  },
  teacher: {
    name: '先生モード',
    prompt: 'あなたは優秀な教師です。物事をわかりやすく説明し、例を使って理解を助けてください。生徒の学習を促進するような質問も投げかけてください。'
  },
  creative: {
    name: 'クリエイティブ',
    prompt: 'あなたは創造的なアイデアを生み出すアシスタントです。独創的で革新的な提案をし、既成概念にとらわれない発想で回答してください。'
  },
  technical: {
    name: 'テクニカル',
    prompt: 'あなたは技術の専門家です。プログラミング、IT、エンジニアリングに関する質問に、技術的な詳細を含めて正確に回答してください。コード例も提供してください。'
  }
}

// X投稿用プリセット
const X_PRESET_PROMPTS = {
  viral: {
    name: 'バズ狙い',
    prompt: 'バズりやすいX（Twitter）の投稿を作成してください。トレンドを意識し、共感を呼ぶ内容で、リツイートされやすい文章を心がけてください。適切なハッシュタグも提案してください。'
  },
  business: {
    name: 'ビジネス告知',
    prompt: 'ビジネス向けのプロフェッショナルなX投稿を作成してください。情報を簡潔にまとめ、CTAを含め、フォロワーのエンゲージメントを促進する内容にしてください。'
  },
  casual: {
    name: 'カジュアル',
    prompt: 'カジュアルで親しみやすいX投稿を作成してください。日常的な話題で、フォロワーとの距離を縮めるような内容にしてください。'
  }
}

// Facebook投稿用プリセット
const FACEBOOK_PRESET_PROMPTS = {
  engagement: {
    name: 'エンゲージメント重視',
    prompt: 'Facebookでエンゲージメントを高める投稿を作成してください。質問を投げかけ、コメントを促し、「いいね」やシェアをしてもらいやすい内容にしてください。'
  },
  storytelling: {
    name: 'ストーリーテリング',
    prompt: 'ストーリー性のあるFacebook投稿を作成してください。読者の感情に訴えかけ、共感を呼ぶような物語形式で書いてください。'
  },
  informative: {
    name: '情報提供',
    prompt: '有益な情報を提供するFacebook投稿を作成してください。読者にとって価値のある知識やTipsを、わかりやすく整理して伝えてください。'
  }
}

// プロフィール用プリセット
const PROFILE_PRESET_PROMPTS = {
  professional: {
    name: 'プロフェッショナル',
    prompt: 'LinkedInやビジネス向けのプロフェッショナルな自己紹介文を作成してください。実績、スキル、経験を強調し、信頼性を高める内容にしてください。'
  },
  creative: {
    name: 'クリエイティブ',
    prompt: '創造的で個性的な自己紹介文を作成してください。独自性を前面に出し、記憶に残るプロフィールにしてください。'
  },
  concise: {
    name: '簡潔',
    prompt: '簡潔で要点をまとめた自己紹介文を作成してください。最も重要な情報だけを含め、読みやすい形式にしてください。'
  }
}

export default function SettingsModal({ isOpen, onClose, botType, onSave }: SettingsModalProps) {
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('')

  // ボットタイプに応じたプリセットを取得
  const getPresets = () => {
    switch (botType) {
      case 'x':
        return X_PRESET_PROMPTS
      case 'facebook':
        return FACEBOOK_PRESET_PROMPTS
      case 'profile':
        return PROFILE_PRESET_PROMPTS
      default:
        return PRESET_PROMPTS
    }
  }

  const presets = getPresets() as Record<string, { name: string; prompt: string }>

  // 初期化：保存されたプロンプトを読み込み
  useEffect(() => {
    if (isOpen) {
      const savedPrompt = localStorage.getItem(`customPrompt_${botType}`)
      if (savedPrompt) {
        setCustomPrompt(savedPrompt)
      } else {
        // デフォルトプロンプトを設定
        const defaultPreset = Object.values(presets)[0]
        setCustomPrompt(defaultPreset.prompt)
      }
    }
  }, [isOpen, botType])

  // プリセット選択時の処理
  const handlePresetSelect = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets]
    if (preset) {
      setCustomPrompt(preset.prompt)
      setSelectedPreset(presetKey)
    }
  }

  // 保存処理
  const handleSave = () => {
    localStorage.setItem(`customPrompt_${botType}`, customPrompt)
    onSave(customPrompt)
    onClose()
  }

  // リセット処理
  const handleReset = () => {
    const defaultPreset = Object.values(presets)[0]
    setCustomPrompt(defaultPreset.prompt)
    setSelectedPreset('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">カスタムプロンプト設定</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 説明 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              AIの振る舞いや応答スタイルをカスタマイズできます。
              プリセットから選択するか、独自のプロンプトを入力してください。
            </p>
          </div>

          {/* プリセット選択 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">プリセット</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedPreset === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* カスタムプロンプト入力 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">カスタムプロンプト</h3>
              <span className="text-xs text-gray-500">
                {customPrompt.length} / 1000 文字
              </span>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setCustomPrompt(e.target.value)
                  setSelectedPreset('')
                }
              }}
              placeholder="AIの振る舞いを定義するプロンプトを入力してください..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* 例 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 ヒント</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 具体的な役割や専門性を定義する</li>
              <li>• 口調やトーンを指定する（フォーマル、カジュアルなど）</li>
              <li>• 応答の長さや詳細度を指定する</li>
              <li>• 特定の知識領域や制約を設定する</li>
            </ul>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>リセット</span>
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
