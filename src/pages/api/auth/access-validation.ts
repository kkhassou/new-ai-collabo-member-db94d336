import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

type AccessRight = {
  admin: boolean;
  user_management: boolean;
  skill_management: boolean;
  challenge_management: boolean;
  idea_management: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  try {
    const { userId, requiredAccess } = req.body;

    if (!userId || !requiredAccess) {
      return res.status(400).json({ error: 'パラメータが不足しています' });
    }

    // ユーザー情報の取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    const accessRights = userData.access_rights as AccessRight;

    // システム管理者は全ての権限を持つ
    if (accessRights?.admin) {
      return res.status(200).json({
        hasAccess: true,
        message: 'システム管理者権限でアクセスが許可されています'
      });
    }

    // 必要な権限の検証
    const hasRequiredAccess = requiredAccess.every((access: keyof AccessRight) => 
      accessRights?.[access] === true
    );

    if (!hasRequiredAccess) {
      return res.status(403).json({
        hasAccess: false,
        message: 'この操作を行う権限がありません'
      });
    }

    // AIを使用した権限判断の補助
    try {
      const aiResponse = await getLlmModelAndGenerateContent(
        'Gemini',
        '権限アクセス判断を行うAIアシスタントとして、ユーザーの権限とアクセス要求を分析し、セキュリティリスクを評価してください。',
        `ユーザー: ${userData.name}
部署: ${userData.department}
要求された権限: ${requiredAccess.join(', ')}`
      );

      const aiDecision = JSON.parse(aiResponse);
      if (!aiDecision.isValid) {
        return res.status(403).json({
          hasAccess: false,
          message: aiDecision.reason
        });
      }
    } catch (error) {
      console.error('AI判断エラー:', error);
      // AIエラー時はデフォルトの権限チェック結果を使用
    }

    // アクセスログの記録
    const { error: logError } = await supabase
      .from('access_logs')
      .insert({
        user_id: userId,
        access_type: requiredAccess,
        granted: true,
        timestamp: new Date().toISOString()
      });

    if (logError) {
      console.error('アクセスログ記録エラー:', logError);
    }

    return res.status(200).json({
      hasAccess: true,
      message: 'アクセスが許可されています',
      userData: {
        id: userData.id,
        name: userData.name,
        department: userData.department,
        position: userData.position
      }
    });

  } catch (error) {
    console.error('アクセス権限検証エラー:', error);
    return res.status(500).json({
      error: 'アクセス権限の検証中にエラーが発生しました',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}