import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

type LoginResponse = {
  success: boolean;
  data?: {
    user: any;
    session: any;
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'メソッドが許可されていません。'
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'メールアドレスとパスワードは必須です。'
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: 'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
      });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      return res.status(500).json({
        success: false,
        error: 'ユーザー情報の取得に失敗しました。'
      });
    }

    const analyzeLoginActivity = await getLlmModelAndGenerateContent(
      'Gemini',
      'ログイン活動を分析し、セキュリティリスクを評価してください。',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        email: email,
        success: true,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      })
    );

    if (analyzeLoginActivity.error) {
      console.error('ログイン分析エラー:', analyzeLoginActivity.error);
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          ...userData,
          id: data.user?.id,
          email: data.user?.email,
        },
        session: data.session
      }
    });

  } catch (error) {
    console.error('ログインエラー:', error);
    return res.status(500).json({
      success: false,
      error: 'サーバーエラーが発生しました。'
    });
  }
}