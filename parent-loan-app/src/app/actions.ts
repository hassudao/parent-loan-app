'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// 1. 新しい借入項目の追加
export async function createLoan(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: '認証エラー: ログインが必要です。' }
  }

  const title = formData.get('title') as string
  const initialAmountStr = formData.get('initialAmount') as string
  const targetDateStr = formData.get('targetDate') as string

  const initialAmount = Number(initialAmountStr)

  if (!title || isNaN(initialAmount) || initialAmount <= 0) {
    return { error: '正しい借入タイトルと正の金額を入力してください。' }
  }

  const { error } = await supabase.from('loans').insert({
    user_id: user.id,
    title,
    initial_amount: initialAmount,
    target_date: targetDateStr || new Date().toISOString().split('T')[0],
  })

  if (error) {
    return { error: '項目の追加に失敗しました: ' + error.message }
  }

  revalidatePath('/')
  return { success: true }
}

// 2. 借入項目自体の削除
export async function deleteLoan(loanId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: '認証エラー: ログインが必要です。' }
  }

  const { error } = await supabase
    .from('loans')
    .delete()
    .eq('id', loanId)
    .eq('user_id', user.id)

  if (error) {
    return { error: '項目の削除に失敗しました: ' + error.message }
  }

  revalidatePath('/')
  return { success: true }
}

// 3. 返済・追加借入（取引履歴）の記録
export async function addTransaction(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: '認証エラー: ログインが必要です。' }
  }

  const loanId = formData.get('loanId') as string
  const type = formData.get('type') as 'repay' | 'borrow'
  const amountStr = formData.get('amount') as string
  const transactionDate = formData.get('transactionDate') as string
  const note = formData.get('note') as string

  const amount = Number(amountStr)

  if (!loanId || !type || isNaN(amount) || amount <= 0 || !transactionDate) {
    return { error: '入力内容に不備があります。金額と日付をご確認ください。' }
  }

  const { error } = await supabase.from('transactions').insert({
    loan_id: loanId,
    user_id: user.id,
    type,
    amount,
    transaction_date: transactionDate,
    note: note || null,
  })

  if (error) {
    return { error: '取引の追加に失敗しました: ' + error.message }
  }

  revalidatePath('/')
  return { success: true }
}

// 4. 取引履歴の削除
export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: '認証エラー: ログインが必要です。' }
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', user.id)

  if (error) {
    return { error: '削除に失敗しました: ' + error.message }
  }

  revalidatePath('/')
  return { success: true }
}