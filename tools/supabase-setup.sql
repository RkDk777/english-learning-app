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

-- 5. 好友系统
CREATE TABLE IF NOT EXISTS friendships (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 6. 私聊消息 (Realtime)
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 留言板
CREATE TABLE IF NOT EXISTS wall_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Realtime 监听
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- 9. profiles 允许所有人搜索
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

-- 10. 社交表 RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_posts ENABLE ROW LEVEL SECURITY;

-- friendships: 用户可读写自己的好友关系
CREATE POLICY "Users can read own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert own friendships"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendships"
  ON friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- chat: 用户可读写参与的消息
CREATE POLICY "Users can read own chats"
  ON chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert own chats"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- wall_posts: 所有人可读，登录用户可写
CREATE POLICY "Anyone can read wall posts"
  ON wall_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert wall posts"
  ON wall_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);
