-- ==========================================
-- 英语学习助手 Supabase 数据库初始化
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ==========================================

-- 1. 用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 学习数据表（每个用户一行，存 JSON）
CREATE TABLE IF NOT EXISTS learning_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  word_progress JSONB DEFAULT '{}'::jsonb,
  grammar_progress JSONB DEFAULT '{}'::jsonb,
  reading_progress JSONB DEFAULT '{}'::jsonb,
  error_book JSONB DEFAULT '[]'::jsonb,
  exam_history JSONB DEFAULT '[]'::jsonb,
  daily_log JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 头像存储桶
-- (在 Dashboard → Storage 中手动创建名为 'avatars' 的公开桶)

-- 4. 行级安全策略（RLS）：用户只能读写自己的数据
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_data ENABLE ROW LEVEL SECURITY;

-- profiles 策略
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- learning_data 策略
CREATE POLICY "Users can read own learning data"
  ON learning_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning data"
  ON learning_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning data"
  ON learning_data FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. 头像桶 RLS 策略
-- (在 Dashboard → Storage → avatars → Policies 中添加)
-- 允许所有人读取公开文件
-- 允许登录用户上传到自己的文件夹 (user_id/)
