'use client'

import { useState } from 'react'
import { logout } from './login/actions'
import { createLoan, deleteLoan, addTransaction, deleteTransaction } from './actions'
import {
  LogOut,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  Trash2,
  PiggyBank,
  AlertCircle,
  FolderPlus,
} from 'lucide-react'

type Loan = {
  id: string
  title: string
  initial_amount: number
  target_date: string | null
  created_at: string
}

type Transaction = {
  id: string
  loan_id: string
  type: 'borrow' | 'repay'
  amount: number
  transaction_date: string
  note: string | null
  created_at: string
}

interface DashboardClientProps {
  userEmail: string
  loans: Loan[]
  transactions: Transaction[]
}

export default function DashboardClient({
  userEmail,
  loans,
  transactions,
}: DashboardClientProps) {
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(
    loans.length > 0 ? loans[0].id : null
  )
  const [showAddLoanModal, setShowAddLoanModal] = useState(false)
  const [showTxForm, setShowTxForm] = useState(false)

  // 全計算
  const grandTotalInitial = loans.reduce((sum, l) => sum + Number(l.initial_amount), 0)
  const grandTotalAdditionalBorrow = transactions
    .filter((t) => t.type === 'borrow')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const grandTotalRepaid = transactions
    .filter((t) => t.type === 'repay')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const grandTotalBorrowed = grandTotalInitial + grandTotalAdditionalBorrow
  const grandRemainingBalance = Math.max(0, grandTotalBorrowed - grandTotalRepaid)
  const grandProgressPercent =
    grandTotalBorrowed > 0
      ? Math.min(100, Math.round((grandTotalRepaid / grandTotalBorrowed) * 100))
      : 0

  // 選択中データ
  const activeLoan = loans.find((l) => l.id === selectedLoanId) || loans[0]
  const activeTransactions = activeLoan
    ? transactions.filter((t) => t.loan_id === activeLoan.id)
    : []

  const activeInitialAmount = activeLoan ? Number(activeLoan.initial_amount) : 0
  const activeAdditionalBorrow = activeTransactions
    .filter((t) => t.type === 'borrow')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const activeTotalRepaid = activeTransactions
    .filter((t) => t.type === 'repay')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const activeTotalBorrowed = activeInitialAmount + activeAdditionalBorrow
  const activeRemainingBalance = Math.max(0, activeTotalBorrowed - activeTotalRepaid)
  const activeProgressPercent =
    activeTotalBorrowed > 0
      ? Math.min(100, Math.round((activeTotalRepaid / activeTotalBorrowed) * 100))
      : 0

  // 項目追加
  async function handleCreateLoan(formData: FormData) {
    setIsPending(true)
    setErrorMessage(null)
    const res = await createLoan(formData)
    if (res?.error) {
      setErrorMessage(res.error)
    } else {
      setShowAddLoanModal(false)
    }
    setIsPending(false)
  }

  // 項目削除
  async function handleDeleteLoan(loanId: string, title: string) {
    if (
      !confirm(
        `「${title}」の借入項目と、これに関連するすべての返済履歴を削除しますか？`
      )
    )
      return

    setIsPending(true)
    const res = await deleteLoan(loanId)
    if (res?.error) {
      alert(res.error)
    } else {
      // 削除後の選択タブをリセット
      const remainingLoans = loans.filter((l) => l.id !== loanId)
      setSelectedLoanId(remainingLoans.length > 0 ? remainingLoans[0].id : null)
    }
    setIsPending(false)
  }

  // 取引追加
  async function handleAddTransaction(formData: FormData) {
    setIsPending(true)
    setErrorMessage(null)
    const res = await addTransaction(formData)
    if (res?.error) {
      setErrorMessage(res.error)
    } else {
      setShowTxForm(false)
    }
    setIsPending(false)
  }

  // 取引削除
  async function handleDeleteTransaction(id: string) {
    if (!confirm('この履歴を削除してもよろしいですか？')) return
    setIsPending(true)
    const res = await deleteTransaction(id)
    if (res?.error) {
      alert(res.error)
    }
    setIsPending(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">親子収支管理</h1>
              <p className="text-xs text-slate-500">{userEmail}</p>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 py-2 px-3 rounded-lg hover:bg-slate-100 transition"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        {loans.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-lg mx-auto text-center">
            <Wallet className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">最初の借入項目を登録</h2>
            <p className="text-sm text-slate-500 mb-6">
              親から借りている用件（例: 学費、車購入代、生活費など）を登録しましょう。
            </p>

            <form action={handleCreateLoan} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  用件・タイトル
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="例: 教習所代・車購入"
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  借りた金額（円）
                </label>
                <input
                  name="initialAmount"
                  type="number"
                  required
                  min="1"
                  placeholder="300000"
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  借りた日
                </label>
                <input
                  name="targetDate"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
              >
                登録して開始する
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* 全体集計カード */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-400 tracking-wider uppercase bg-blue-500/20 px-3 py-1 rounded-full">
                    全借入の総合計
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
                    総残り残高 ¥{grandRemainingBalance.toLocaleString()}
                  </h2>
                </div>

                <button
                  onClick={() => setShowAddLoanModal(true)}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-blue-600/30 transition"
                >
                  <FolderPlus className="w-5 h-5" />
                  新しい借入用件を追加
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm font-medium mb-2 text-slate-300">
                  <span>全体の返済達成率</span>
                  <span className="text-blue-400 font-bold">{grandProgressPercent}%</span>
                </div>
                <div className="w-full bg-slate-700/60 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${grandProgressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-700/60 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-1">全借入総額</p>
                  <p className="text-lg font-bold text-white">
                    ¥{grandTotalBorrowed.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-400 mb-1">全返済済み合計</p>
                  <p className="text-lg font-bold text-emerald-400">
                    ¥{grandTotalRepaid.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-slate-400 mb-1">登録用件数</p>
                  <p className="text-lg font-bold text-white">{loans.length} 件</p>
                </div>
              </div>
            </div>

            {/* 用件追加モーダル */}
            {showAddLoanModal && (
              <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-lg relative">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-blue-600" />
                  新しい借入用件を追加する
                </h3>
                <form action={handleCreateLoan} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        用件タイトル
                      </label>
                      <input
                        name="title"
                        type="text"
                        required
                        placeholder="例: 車の免許費用"
                        className="w-full p-3 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        借りた金額（円）
                      </label>
                      <input
                        name="initialAmount"
                        type="number"
                        required
                        min="1"
                        placeholder="250000"
                        className="w-full p-3 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        借りた日
                      </label>
                      <input
                        name="targetDate"
                        type="date"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddLoanModal(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
                    >
                      項目を追加
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* タブと個別カード */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 overflow-x-auto">
                <div className="flex gap-2">
                  {loans.map((loan) => (
                    <button
                      key={loan.id}
                      onClick={() => {
                        setSelectedLoanId(loan.id)
                        setShowTxForm(false)
                      }}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
                        activeLoan?.id === loan.id
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {loan.title}
                    </button>
                  ))}
                </div>
              </div>

              {activeLoan && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-md">
                        選択中の用件
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 mt-2">
                        {activeLoan.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        借りた日: <span className="font-medium text-slate-700">{activeLoan.target_date || '未設定'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* 用件削除ボタン */}
                      <button
                        onClick={() => handleDeleteLoan(activeLoan.id, activeLoan.title)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition"
                        title="この用件を削除"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">用件を削除</span>
                      </button>

                      <button
                        onClick={() => setShowTxForm(!showTxForm)}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-medium shadow-md shadow-emerald-600/10 transition"
                      >
                        <PlusCircle className="w-5 h-5" />
                        返済・借入を記録
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-slate-600">この項目の残高</span>
                      <span className="text-slate-900 font-bold">
                        残り ¥{activeRemainingBalance.toLocaleString()} / 元金 ¥{activeTotalBorrowed.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${activeProgressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 取引フォーム */}
            {showTxForm && activeLoan && (
              <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-md">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  「{activeLoan.title}」への取引記録
                </h3>
                <form action={handleAddTransaction} className="space-y-4">
                  <input type="hidden" name="loanId" value={activeLoan.id} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        種別
                      </label>
                      <select
                        name="type"
                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
                      >
                        <option value="repay">返済する（マイナス）</option>
                        <option value="borrow">追加で借りる（プラス）</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        金額（円）
                      </label>
                      <input
                        name="amount"
                        type="number"
                        required
                        min="1"
                        placeholder="10000"
                        className="w-full p-3 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        取引日付
                      </label>
                      <input
                        name="transactionDate"
                        type="date"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        メモ（任意）
                      </label>
                      <input
                        name="note"
                        type="text"
                        placeholder="例: 手渡し返済"
                        className="w-full p-3 rounded-xl border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTxForm(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition text-sm"
                    >
                      記録を保存
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 取引履歴一覧 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  「{activeLoan?.title}」の取引履歴
                </h3>
                <span className="text-xs text-slate-500">
                  全 {activeTransactions.length} 件
                </span>
              </div>

              {activeTransactions.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  この項目にはまだ取引履歴がありません。「返済・借入を記録」から登録できます。
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            tx.type === 'repay'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {tx.type === 'repay' ? (
                            <TrendingDown className="w-5 h-5" />
                          ) : (
                            <TrendingUp className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {tx.type === 'repay' ? '返済' : '追加借入'}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {tx.transaction_date}
                            </span>
                          </div>
                          {tx.note && (
                            <p className="text-xs text-slate-500 mt-1">{tx.note}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`text-base font-extrabold ${
                            tx.type === 'repay'
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {tx.type === 'repay' ? '-' : '+'}¥
                          {Number(tx.amount).toLocaleString()}
                        </span>

                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          disabled={isPending}
                          className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-slate-100 transition"
                          title="履歴を削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}