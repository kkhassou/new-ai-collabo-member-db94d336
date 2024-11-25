import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

type UserSkill = {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  updated_at: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  department: string;
};

const REMINDER_THRESHOLD_DAYS = 90; // スキル更新のリマインド閾値（日数）

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. 最終更新日の確認と更新期限超過ユーザーの抽出
    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select(`
        id,
        user_id,
        skill_id,
        level,
        updated_at
      `);

    if (skillsError) throw skillsError;

    const now = new Date();
    const threshold = new Date(now.setDate(now.getDate() - REMINDER_THRESHOLD_DAYS));

    const outdatedSkillUsers = new Set(
      userSkills
        ?.filter(skill => new Date(skill.updated_at) < threshold)
        .map(skill => skill.user_id)
    );

    if (outdatedSkillUsers.size === 0) {
      return res.status(200).json({ message: 'No users need reminder' });
    }

    // 2. 対象ユーザー情報の取得
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, department')
      .in('id', Array.from(outdatedSkillUsers));

    if (usersError) throw usersError;

    // 3. リマインドメールテンプレート作成
    const emailPrompt = `
      スキル情報更新のリマインドメールを作成してください。
      以下の点を含めてください：
      - スキル情報の定期的な更新の重要性
      - 最終更新から${REMINDER_THRESHOLD_DAYS}日が経過していること
      - スキルの更新手順
      - 更新期限
    `;

    const emailTemplate = await getLlmModelAndGenerateContent(
      'Gemini',
      'メール文章生成',
      emailPrompt
    ).catch(() => ({
      content: `
        【スキル情報更新のお願い】
        
        いつもお世話になっております。
        スキル情報の定期更新時期となりましたので、ご案内させていただきます。

        最終更新から${REMINDER_THRESHOLD_DAYS}日が経過しており、
        最新のスキル状況を反映させるため、更新をお願いいたします。

        ◆更新手順
        1. スキル管理システムにログイン
        2. マイページより「スキル情報更新」を選択
        3. 各スキルの最新状況を入力
        4. 保存して完了

        ◆更新期限
        ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}まで

        ご不明な点がございましたら、お気軽にご連絡ください。
      `
    }));

    // 4. メール送信処理
    for (const user of users || []) {
      try {
        await axios.post(process.env.MAIL_API_ENDPOINT!, {
          to: user.email,
          subject: 'スキル情報更新のリマインド',
          text: emailTemplate.content.replace('{USER_NAME}', user.name)
        });

        // 5. 通知履歴の記録
        await supabase
          .from('notification_logs')
          .insert({
            user_id: user.id,
            type: 'skill_update_reminder',
            status: 'sent',
            content: emailTemplate.content
          });

      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        
        // エラー時も履歴を記録
        await supabase
          .from('notification_logs')
          .insert({
            user_id: user.id,
            type: 'skill_update_reminder',
            status: 'failed',
            content: emailTemplate.content,
            error_detail: JSON.stringify(error)
          });
      }
    }

    return res.status(200).json({
      message: 'Reminder process completed',
      reminded_users: users?.length || 0
    });

  } catch (error) {
    console.error('Reminder process error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      detail: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}