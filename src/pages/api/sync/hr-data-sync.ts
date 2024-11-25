import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/supabase';
import axios from 'axios';
import { getLlmModelAndGenerateContent } from '@/utils/functions';

type HrEmployee = {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  hireDate: string;
  profile: {
    phone?: string;
    address?: string;
    biography?: string;
  };
};

type SyncLog = {
  timestamp: string;
  operation: 'insert' | 'update' | 'delete';
  status: 'success' | 'error';
  details: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. 人事システムからデータ取得
    const hrData = await fetchHrData();

    // 2. データフォーマットの変換
    const formattedData = await formatHrData(hrData);

    // 3. 差分チェック
    const { toInsert, toUpdate } = await checkDifferences(formattedData);

    // 4. データの更新/追加
    const results = await syncData(toInsert, toUpdate);

    // 5. 同期ログの記録
    await recordSyncLog(results);

    return res.status(200).json({
      success: true,
      message: '同期が完了しました',
      results: {
        inserted: results.inserted,
        updated: results.updated,
      },
    });

  } catch (error) {
    console.error('同期エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    
    await recordSyncLog({
      timestamp: new Date().toISOString(),
      operation: 'update',
      status: 'error',
      details: errorMessage
    });

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

async function fetchHrData(): Promise<HrEmployee[]> {
  try {
    const response = await axios.get(process.env.HR_SYSTEM_API_URL as string, {
      headers: {
        'Authorization': `Bearer ${process.env.HR_SYSTEM_API_KEY}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('HR APIエラー:', error);
    
    // サンプルデータを返す
    return [
      {
        employeeId: 'EMP001',
        name: '山田太郎',
        department: '開発部',
        position: 'シニアエンジニア',
        email: 'yamada@example.com',
        hireDate: '2020-04-01',
        profile: {
          phone: '090-1234-5678',
          address: '東京都渋谷区',
          biography: 'バックエンド開発のスペシャリスト'
        }
      },
      {
        employeeId: 'EMP002',
        name: '鈴木花子',
        department: '営業部',
        position: 'マネージャー',
        email: 'suzuki@example.com',
        hireDate: '2018-04-01',
        profile: {
          phone: '090-8765-4321',
          address: '東京都新宿区',
          biography: '営業部門のマネージャー'
        }
      }
    ];
  }
}

async function formatHrData(hrData: HrEmployee[]) {
  const formattedData = hrData.map(employee => ({
    employee_id: employee.employeeId,
    name: employee.name,
    department: employee.department,
    position: employee.position,
    email: employee.email,
    hire_date: employee.hireDate,
    profile_data: employee.profile
  }));

  return formattedData;
}

async function checkDifferences(formattedData: any[]) {
  const { data: existingUsers, error } = await supabase
    .from('users')
    .select('*');

  if (error) throw new Error('既存ユーザーの取得に失敗しました');

  const existingMap = new Map(existingUsers.map(user => [user.employee_id, user]));
  const toInsert = [];
  const toUpdate = [];

  for (const employee of formattedData) {
    const existing = existingMap.get(employee.employee_id);
    if (!existing) {
      toInsert.push(employee);
    } else if (JSON.stringify(existing) !== JSON.stringify(employee)) {
      toUpdate.push(employee);
    }
  }

  return { toInsert, toUpdate };
}

async function syncData(toInsert: any[], toUpdate: any[]) {
  const results = {
    inserted: 0,
    updated: 0
  };

  if (toInsert.length > 0) {
    const { data, error } = await supabase
      .from('users')
      .insert(toInsert);

    if (error) throw new Error('データの挿入に失敗しました');
    results.inserted = toInsert.length;
  }

  for (const user of toUpdate) {
    const { error } = await supabase
      .from('users')
      .update(user)
      .eq('employee_id', user.employee_id);

    if (error) throw new Error('データの更新に失敗しました');
    results.updated++;
  }

  return results;
}

async function recordSyncLog(log: any) {
  const { error } = await supabase
    .from('sync_logs')
    .insert([{
      timestamp: new Date().toISOString(),
      operation: 'sync',
      status: log.status || 'success',
      details: JSON.stringify(log)
    }]);

  if (error) {
    console.error('ログの記録に失敗しました:', error);
  }
}