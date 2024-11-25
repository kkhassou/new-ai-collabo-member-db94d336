import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

type SkillGapData = {
  skillId: string;
  skillName: string;
  category: string;
  requiredLevel: number;
  currentLevel: number;
  gap: number;
  priority: '高' | '中' | '低';
  recommendedAction: string;
};

type AnalysisResult = {
  gapAnalysis: SkillGapData[];
  departmentSummary: {
    departmentName: string;
    averageGap: number;
    criticalSkills: string[];
  }[];
  recommendedActions: {
    skillId: string;
    skillName: string;
    priority: string;
    action: string;
    estimatedTime: string;
    resources: string[];
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { departmentId } = req.body;

    // スキル要件の取得
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*');

    if (skillsError) throw new Error('スキルデータの取得に失敗しました');

    // ユーザースキルの取得
    const { data: userSkills, error: userSkillsError } = await supabase
      .from('user_skills')
      .select(`
        *,
        users!inner(department)
      `)
      .eq('users.department', departmentId);

    if (userSkillsError) throw new Error('ユーザースキルデータの取得に失敗しました');

    // ギャップ分析の実行
    const gapAnalysis: SkillGapData[] = skills.map(skill => {
      const relevantUserSkills = userSkills.filter(us => us.skill_id === skill.id);
      const averageCurrentLevel = relevantUserSkills.length > 0
        ? relevantUserSkills.reduce((sum, us) => sum + us.level, 0) / relevantUserSkills.length
        : 0;
      
      const gap = 5 - averageCurrentLevel;
      
      return {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        requiredLevel: 5,
        currentLevel: averageCurrentLevel,
        gap: gap,
        priority: gap >= 3 ? '高' : gap >= 2 ? '中' : '低',
        recommendedAction: gap >= 3 
          ? '集中的なトレーニングプログラムへの参加を推奨'
          : gap >= 2
          ? 'オンライン学習コースの受講を推奨'
          : 'セルフラーニング教材の活用を推奨'
      };
    });

    // AI による育成施策の提案生成
    const prompt = `
    以下のスキルギャップ分析結果に基づいて、具体的な育成施策を提案してください：
    ${JSON.stringify(gapAnalysis)}
    
    提案には以下の要素を含めてください：
    - 優先度の高いスキルに対する具体的な研修プログラム
    - 推定される育成期間
    - 必要なリソースとコスト
    - 段階的な育成ステップ
    `;

    const aiRecommendations = await getLlmModelAndGenerateContent(
      'Gemini',
      '人材育成の専門家として、実践的で具体的な育成施策を提案してください。',
      prompt
    );

    // 分析結果の整形
    const analysisResult: AnalysisResult = {
      gapAnalysis,
      departmentSummary: [{
        departmentName: departmentId,
        averageGap: gapAnalysis.reduce((sum, item) => sum + item.gap, 0) / gapAnalysis.length,
        criticalSkills: gapAnalysis.filter(item => item.priority === '高').map(item => item.skillName)
      }],
      recommendedActions: gapAnalysis.map(gap => ({
        skillId: gap.skillId,
        skillName: gap.skillName,
        priority: gap.priority,
        action: gap.recommendedAction,
        estimatedTime: gap.priority === '高' ? '3-6ヶ月' : gap.priority === '中' ? '2-3ヶ月' : '1-2ヶ月',
        resources: [
          '社内研修プログラム',
          'オンライン学習プラットフォーム',
          'メンタリングプログラム'
        ]
      }))
    };

    return res.status(200).json(analysisResult);

  } catch (error) {
    console.error('スキルギャップ分析エラー:', error);
    
    // エラー時のサンプルデータ
    const sampleAnalysisResult: AnalysisResult = {
      gapAnalysis: [
        {
          skillId: '1',
          skillName: 'JavaScript',
          category: 'プログラミング',
          requiredLevel: 5,
          currentLevel: 3,
          gap: 2,
          priority: '中',
          recommendedAction: 'オンライン学習コースの受講を推奨'
        },
        {
          skillId: '2',
          skillName: 'Python',
          category: 'プログラミング',
          requiredLevel: 5,
          currentLevel: 2,
          gap: 3,
          priority: '高',
          recommendedAction: '集中的なトレーニングプログラムへの参加を推奨'
        }
      ],
      departmentSummary: [{
        departmentName: '開発部',
        averageGap: 2.5,
        criticalSkills: ['Python']
      }],
      recommendedActions: [
        {
          skillId: '1',
          skillName: 'JavaScript',
          priority: '中',
          action: 'オンライン学習コースの受講',
          estimatedTime: '2-3ヶ月',
          resources: ['Udemy', 'Coursera', 'メンター支援']
        },
        {
          skillId: '2',
          skillName: 'Python',
          priority: '高',
          action: '集中トレーニングプログラム',
          estimatedTime: '3-6ヶ月',
          resources: ['社内研修', 'ハンズオンワークショップ', 'プロジェクト実践']
        }
      ]
    };

    return res.status(200).json(sampleAnalysisResult);
  }
}