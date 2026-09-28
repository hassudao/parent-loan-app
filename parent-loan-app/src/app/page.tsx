import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function HomePage() {
  const supabase = await createClient()

  // ログインユーザーの検証
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. ユーザーの借入設定（loans）を取得
  const { data: loans } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 2. 取引履歴（transactions）を取得
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })

  return (
    <DashboardClient
      userEmail={user.email ?? ''}
      loans={loans || []}
      transactions={transactions || []}
    />
  )
}