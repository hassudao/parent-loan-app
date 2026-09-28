'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { Lock, Mail, ArrowRight, UserPlus, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setErrorMessage(null)

    const action = isSignUp ? signup : login
    const result = await action(formData)

    if (result?.error) {
      setErrorMessage(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isSignUp ? 'アカウント作成' : '親子収支管理にログイン'}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {isSignUp
              ? '安全な管理を始めるために登録してください'
              : '登録したメールアドレスとパスワードでログイン'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {errorMessage}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              メールアドレス
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                name="email"
                type="email"
                required
                placeholder="example@mail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              パスワード（8文字以上）
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {isPending ? (
              <span>処理中...</span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-5 h-5" />
                新規登録する
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                ログイン
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMessage(null)
            }}
            className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
          >
            {isSignUp
              ? 'すでにアカウントをお持ちの方はこちら'
              : '初めてご利用の方（新規アカウント作成）'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}