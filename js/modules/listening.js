import { tts } from '../utils/tts.js';
import { storage } from '../utils/storage.js';
import { dataLoader } from '../utils/data-loader.js';

function getMain() { return document.getElementById('main-content'); }

// Sample sentences for dictation practice (used when no data file loaded)
const DEFAULT_SENTENCES = {
  junior: [
    { en: 'Good morning, class.', zh: '早上好，同学们。', difficulty: 'easy' },
    { en: 'What time do you get up every day?', zh: '你每天几点起床？', difficulty: 'easy' },
    { en: 'There is a book on the desk.', zh: '书桌上有一本书。', difficulty: 'easy' },
    { en: 'She is good at playing the piano.', zh: '她擅长弹钢琴。', difficulty: 'easy' },
    { en: 'I have been learning English for three years.', zh: '我已经学了三年英语。', difficulty: 'medium' },
    { en: 'The weather is getting warmer and warmer.', zh: '天气变得越来越暖和了。', difficulty: 'medium' },
    { en: 'He asked me if I had finished my homework.', zh: '他问我是否完成了作业。', difficulty: 'medium' },
    { en: 'My father bought me a new bike yesterday.', zh: '我爸爸昨天给我买了一辆新自行车。', difficulty: 'medium' },
    { en: 'The Great Wall is one of the wonders of the world.', zh: '长城是世界奇迹之一。', difficulty: 'medium' },
    { en: 'If it rains tomorrow, we will stay at home.', zh: '如果明天下雨，我们就待在家。', difficulty: 'medium' },
  ],
  senior: [
    { en: 'It is widely believed that education plays a vital role in personal development.', zh: '人们普遍认为教育在个人发展中起着至关重要的作用。', difficulty: 'medium' },
    { en: 'Not until he finished the project did he realize how challenging it was.', zh: '直到完成项目，他才意识到它有多具挑战性。', difficulty: 'hard' },
    { en: 'The government has taken measures to reduce air pollution in major cities.', zh: '政府已经采取措施减少大城市的空气污染。', difficulty: 'medium' },
    { en: 'What impressed me most was her determination to overcome all difficulties.', zh: '最让我印象深刻的是她克服一切困难的决心。', difficulty: 'hard' },
    { en: 'There is no doubt that hard work leads to success.', zh: '毫无疑问，努力工作会带来成功。', difficulty: 'medium' },
    { en: 'Only by taking immediate action can we protect the environment from further damage.', zh: '只有立即采取行动，我们才能保护环境免受进一步破坏。', difficulty: 'hard' },
    { en: 'The novel, which was published last year, has become a bestseller worldwide.', zh: '这部去年出版的小说已成为全球畅销书。', difficulty: 'medium' },
    { en: 'It never occurred to me that such a small mistake could cause so many problems.', zh: '我从没想过这么小的一个错误会引起这么多问题。', difficulty: 'hard' },
    { en: 'Scientists are exploring new ways to make renewable energy more affordable.', zh: '科学家正在探索使可再生能源更便宜的新方法。', difficulty: 'hard' },
    { en: 'With the development of technology, our lives have changed dramatically.', zh: '随着科技的发展，我们的生活发生了巨大的变化。', difficulty: 'medium' },
  ],
};

// ========== Listening Home Page ==========
export async function showListeningHome() {
  getMain().innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1>🎧 听力练习</h1>
        <p>训练英语听力，提升辨音能力</p>
      </div>

      <div class="grid-2 mb-3">
        <div class="card" style="cursor:pointer;" id="mode-dictation">
          <div class="card-body text-center">
            <div style="font-size:3rem;">✍️</div>
            <h2 style="margin:12px 0;">听写模式</h2>
            <p class="text-secondary">听句子/单词 → 写出内容 → 比对答案</p>
          </div>
        </div>
        <div class="card" style="cursor:pointer;" id="mode-select">
          <div class="card-body text-center">
            <div style="font-size:3rem;">🔤</div>
            <h2 style="margin:12px 0;">听选模式</h2>
            <p class="text-secondary">听发音 → 选择正确含义</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>选择难度</h3></div>
        <div class="card-body">
          <div class="flex gap-1">
            <button class="btn btn-secondary level-btn active" data-level="junior">🏫 初中难度</button>
            <button class="btn btn-secondary level-btn" data-level="senior">🎓 高中难度</button>
          </div>
        </div>
      </div>
    </div>
  `;

  let currentLevel = 'junior';

  getMain().querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      getMain().querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLevel = btn.dataset.level;
    });
  });

  getMain().querySelector('#mode-dictation').addEventListener('click', () => {
    startDictation(currentLevel);
  });

  getMain().querySelector('#mode-select').addEventListener('click', () => {
    startListenSelect(currentLevel);
  });
}

// ========== Dictation Mode ==========
function startDictation(level) {
  const sentences = DEFAULT_SENTENCES[level];
  let currentIndex = 0;
  const shuffled = [...sentences].sort(() => Math.random() - 0.5);

  function render() {
    if (currentIndex >= shuffled.length) {
      getMain().innerHTML = `
        <div class="page">
          <div class="page-header">
            <button class="btn btn-secondary btn-sm mb-1" id="btn-back-listen">← 返回</button>
            <h1>🎉 听写完成！</h1>
          </div>
          <div class="card" style="text-align:center;padding:40px;">
            <div style="font-size:3rem;">🎉</div>
            <p class="text-secondary">已完成全部 ${shuffled.length} 句听写</p>
            <button class="btn btn-primary mt-2" id="btn-restart-dict">🔄 重新练习</button>
          </div>
        </div>
      `;
      getMain().querySelector('#btn-back-listen')?.addEventListener('click', () => showListeningHome());
      getMain().querySelector('#btn-restart-dict')?.addEventListener('click', () => {
        currentIndex = 0;
        render();
      });
      return;
    }

    const sentence = shuffled[currentIndex];

    getMain().innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-secondary btn-sm mb-1" id="btn-back-listen">← 返回</button>
          <h1>✍️ 听写练习</h1>
          <p>第 ${currentIndex + 1} / ${shuffled.length} 句 · ${level === 'junior' ? '初中' : '高中'}难度</p>
        </div>

        <div class="listening-controls">
          <span style="font-size:var(--fs-sm);color:var(--color-text-muted);">语速:</span>
          <button class="speed-btn" data-rate="0.7">0.7x</button>
          <button class="speed-btn active" data-rate="1">1x</button>
          <button class="speed-btn" data-rate="1.3">1.3x</button>
        </div>

        <button class="listening-play-btn" id="play-btn">🔊</button>

        <div style="max-width:600px;margin:0 auto;">
          <input type="text" class="quiz-input" id="dictation-input"
            placeholder="在这里输入你听到的内容..." autocomplete="off" autocapitalize="off">
        </div>

        <div class="flex justify-center gap-1 mt-2">
          <button class="btn btn-primary" id="btn-check">✓ 检查答案</button>
          <button class="btn btn-secondary" id="btn-skip">→ 跳过</button>
          <button class="btn btn-secondary" id="btn-reveal">👁 显示答案</button>
        </div>

        <div id="dict-result" style="max-width:600px;margin:16px auto 0;"></div>
      </div>
    `;

    let currentRate = 1;

    // Speed buttons
    getMain().querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        getMain().querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRate = parseFloat(btn.dataset.rate);
        tts.setRate(currentRate);
      });
    });

    // Play button
    getMain().querySelector('#play-btn').addEventListener('click', async () => {
      const btn = getMain().querySelector('#play-btn');
      btn.textContent = '⏳';
      btn.style.pointerEvents = 'none';
      try {
        await tts.speak(sentence.en, currentRate);
      } catch { /* ignore */ }
      btn.textContent = '🔊';
      btn.style.pointerEvents = 'auto';
    });

    // Check answer
    getMain().querySelector('#btn-check').addEventListener('click', () => {
      const input = getMain().querySelector('#dictation-input').value.trim();
      const resultDiv = getMain().querySelector('#dict-result');
      const isCorrect = input.toLowerCase() === sentence.en.toLowerCase();

      storage.logActivity('listening', 1);

      if (isCorrect) {
        resultDiv.innerHTML = `
          <div class="quiz-feedback correct">✓ 完全正确！</div>
          <div style="text-align:center;margin-top:8px;">
            <span class="zh" style="color:var(--color-text-secondary);">${sentence.zh}</span>
          </div>
        `;
      } else {
        // Simple similarity check
        const similarity = calcSimilarity(input.toLowerCase(), sentence.en.toLowerCase());
        resultDiv.innerHTML = `
          <div class="quiz-feedback wrong">${similarity > 0.7 ? '⚠️ 接近了，但有些小错误' : '✗ 有较大差异'}</div>
          <div style="text-align:center;margin-top:8px;">
            ${input ? `<div style="color:var(--color-danger);text-decoration:line-through;">你的答案: ${input}</div>` : '<div style="color:var(--color-text-muted);">未输入答案</div>'}
            <div style="color:var(--color-success);font-weight:600;font-size:var(--fs-lg);">正确答案: ${sentence.en}</div>
            <div style="color:var(--color-text-secondary);margin-top:4px;">${sentence.zh}</div>
          </div>
        `;

        if (!isCorrect) {
          storage.addError({
            module: 'listening',
            itemKey: `dict:${sentence.en}`,
            question: '听写: ' + sentence.zh,
            userAnswer: input || '未作答',
            correctAnswer: sentence.en,
          });
        }
      }
      // Show next button
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary mt-2';
      nextBtn.textContent = '下一句 →';
      nextBtn.addEventListener('click', () => {
        currentIndex++;
        render();
      });
      resultDiv.appendChild(nextBtn);
    });

    // Skip
    getMain().querySelector('#btn-skip').addEventListener('click', () => {
      currentIndex++;
      render();
    });

    // Reveal
    getMain().querySelector('#btn-reveal').addEventListener('click', () => {
      const resultDiv = getMain().querySelector('#dict-result');
      resultDiv.innerHTML = `
        <div style="text-align:center;">
          <div style="color:var(--color-primary);font-weight:600;font-size:var(--fs-lg);">${sentence.en}</div>
          <div style="color:var(--color-text-secondary);">${sentence.zh}</div>
        </div>
      `;
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary mt-2';
      nextBtn.textContent = '下一句 →';
      nextBtn.addEventListener('click', () => { currentIndex++; render(); });
      resultDiv.appendChild(nextBtn);
    });

    getMain().querySelector('#btn-back-listen')?.addEventListener('click', () => showListeningHome());

    // Auto-play on load
    setTimeout(() => getMain().querySelector('#play-btn')?.click(), 300);
  }

  render();
}

// ========== Listen & Select Mode ==========
function startListenSelect(level) {
  const sentences = DEFAULT_SENTENCES[level];
  let currentIndex = 0;
  const shuffled = [...sentences].sort(() => Math.random() - 0.5);
  let score = 0;

  function render() {
    if (currentIndex >= shuffled.length) {
      getMain().innerHTML = `
        <div class="page">
          <div class="page-header">
            <button class="btn btn-secondary btn-sm mb-1" id="btn-back-listen">← 返回</button>
            <h1>🎉 练习完成！</h1>
          </div>
          <div class="quiz-result">
            <div style="font-size:4rem;">${score >= shuffled.length * 0.8 ? '🎉' : '👍'}</div>
            <div class="score">${Math.round(score / shuffled.length * 100)}%</div>
            <p class="text-secondary">正确 ${score} / ${shuffled.length} 题</p>
            <button class="btn btn-primary mt-2" id="btn-restart-sel">🔄 重新练习</button>
          </div>
        </div>
      `;
      getMain().querySelector('#btn-back-listen')?.addEventListener('click', () => showListeningHome());
      getMain().querySelector('#btn-restart-sel')?.addEventListener('click', () => {
        currentIndex = 0;
        score = 0;
        render();
      });
      return;
    }

    const sentence = shuffled[currentIndex];
    // Pick random distractors
    const others = sentences.filter(s => s.zh !== sentence.zh);
    const distractors = others.sort(() => Math.random() - 0.5).slice(0, 3).map(s => s.zh);
    const options = [sentence.zh, ...distractors].sort(() => Math.random() - 0.5);

    getMain().innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-secondary btn-sm mb-1" id="btn-back-listen">← 返回</button>
          <h1>🔤 听音选义</h1>
          <p>第 ${currentIndex + 1} / ${shuffled.length} 题 · 得分: ${score}</p>
        </div>

        <div style="text-align:center;">
          <button class="listening-play-btn" id="play-btn">🔊</button>
          <p class="text-secondary" style="margin:8px 0;">点击播放，选择对应的中文含义</p>
        </div>

        <div class="quiz-options" style="max-width:600px;margin:0 auto;" id="options-container">
          ${options.map((opt, i) => `
            <button class="quiz-option" data-answer="${escapeHtml(opt)}">
              ${String.fromCharCode(65 + i)}. ${opt}
            </button>
          `).join('')}
        </div>

        <div id="select-result" style="max-width:600px;margin:16px auto 0;text-align:center;"></div>
      </div>
    `;

    // Play button
    getMain().querySelector('#play-btn').addEventListener('click', async () => {
      const btn = getMain().querySelector('#play-btn');
      btn.textContent = '⏳';
      btn.style.pointerEvents = 'none';
      try {
        await tts.speak(sentence.en);
      } catch { /* ignore */ }
      btn.textContent = '🔊';
      btn.style.pointerEvents = 'auto';
    });

    // Options
    getMain().querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const answer = btn.dataset.answer;
        const isCorrect = answer === sentence.zh;
        if (isCorrect) score++;

        storage.logActivity('listening', 1);

        const resultDiv = getMain().querySelector('#select-result');
        resultDiv.innerHTML = `
          <div class="quiz-feedback ${isCorrect ? 'correct' : 'wrong'}">
            ${isCorrect ? '✓ 正确！' : '✗ 错误'}
          </div>
          ${!isCorrect ? `<div style="margin-top:8px;color:var(--color-success);">正确答案: ${sentence.zh}</div>` : ''}
          <div style="color:var(--color-text-secondary);margin-top:4px;">${sentence.en}</div>
        `;

        if (!isCorrect) {
          storage.addError({
            module: 'listening',
            itemKey: `select:${sentence.en}`,
            question: '听音选义',
            userAnswer: answer,
            correctAnswer: sentence.zh,
          });
        }

        // Disable all options
        getMain().querySelectorAll('.quiz-option').forEach(b => {
          b.disabled = true;
          if (b.dataset.answer === sentence.zh) b.classList.add('correct');
          if (b.dataset.answer === answer && !isCorrect) b.classList.add('wrong');
        });

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary mt-2';
        nextBtn.textContent = '下一题 →';
        nextBtn.addEventListener('click', () => { currentIndex++; render(); });
        resultDiv.appendChild(nextBtn);
      });
    });

    getMain().querySelector('#btn-back-listen')?.addEventListener('click', () => showListeningHome());

    // Auto-play
    setTimeout(() => getMain().querySelector('#play-btn')?.click(), 300);
  }

  render();
}

// Simple Levenshtein-based similarity
function calcSimilarity(a, b) {
  if (!a || !b) return 0;
  const lenA = a.length, lenB = b.length;
  const matrix = Array.from({ length: lenA + 1 }, () => Array(lenB + 1).fill(0));
  for (let i = 0; i <= lenA; i++) matrix[i][0] = i;
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j;
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return 1 - matrix[lenA][lenB] / Math.max(lenA, lenB);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
