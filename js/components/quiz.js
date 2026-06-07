import { tts } from '../utils/tts.js';

/**
 * Quiz component — renders an interactive quiz session
 * @param {Array} questions - Quiz question objects
 * @param {Function} onComplete - Called with { total, correct, score, results }
 */
export function createQuiz(questions, onComplete) {
  let currentIndex = 0;
  let answers = new Array(questions.length).fill('');
  let questionState = new Array(questions.length).fill('unanswered'); // unanswered | correct | wrong

  const container = document.createElement('div');
  container.className = 'quiz-container';

  function renderQuestion() {
    const q = questions[currentIndex];
    const state = questionState[currentIndex];

    container.innerHTML = `
      <div class="quiz-progress">
        <span class="text-secondary" style="font-size:var(--fs-sm);">第 ${currentIndex + 1} / ${questions.length} 题</span>
        <div class="progress-bar" style="flex:1;">
          <div class="progress-fill" style="width:${((currentIndex) / questions.length) * 100}%;"></div>
        </div>
        <span class="text-muted" style="font-size:var(--fs-sm);">
          正确: ${questionState.filter(s => s === 'correct').length}
        </span>
      </div>
      <div class="quiz-question">
        <div class="q-prompt">${q.prompt}</div>
        ${renderQuestionBody(q, state)}
      </div>
      ${state !== 'unanswered' ? renderFeedback(q, state) : ''}
      <div class="flex justify-between mt-2">
        <button class="btn btn-secondary btn-sm" id="quiz-prev" ${currentIndex === 0 ? 'disabled' : ''}>上一题</button>
        ${currentIndex < questions.length - 1
          ? `<button class="btn btn-primary btn-sm" id="quiz-next">下一题 →</button>`
          : `<button class="btn btn-success btn-sm" id="quiz-finish">✓ 完成测验</button>`
        }
      </div>
    `;

    bindEvents(q);
  }

  function renderQuestionBody(q, state) {
    switch (q.type) {
      case 'en-to-zh':
      case 'grammar':
        return renderOptions(q, state);
      case 'spelling':
        return renderSpelling(q, state);
      case 'listening':
        return renderListening(q, state);
      default:
        return renderOptions(q, state);
    }
  }

  function renderOptions(q, state) {
    const savedAnswer = answers[currentIndex];
    return `
      <div class="quiz-options">
        ${q.options.map((opt, i) => {
          let cls = '';
          if (state === 'correct' && opt === q.answer) cls = 'correct';
          if (state === 'wrong') {
            if (opt === savedAnswer) cls = 'wrong';
            if (opt === q.answer) cls = 'correct';
          }
          if (state === 'unanswered' && opt === savedAnswer) cls = 'selected';
          return `<button class="quiz-option ${cls}" data-answer="${escapeHtml(opt)}" ${state !== 'unanswered' ? 'disabled' : ''}>${String.fromCharCode(65 + i)}. ${opt}</button>`;
        }).join('')}
      </div>
    `;
  }

  function renderSpelling(q, state) {
    const savedAnswer = answers[currentIndex];
    return `
      <div style="text-align:center;">
        <div style="font-size:var(--fs-2xl);color:var(--color-text);margin-bottom:20px;font-weight:600;">${q.hint}</div>
        ${q.phonetic ? `<div style="color:var(--color-text-muted);margin-bottom:12px;">${q.phonetic} ${q.pos || ''}</div>` : ''}
        <input type="text" class="quiz-input" id="spelling-input"
          placeholder="输入英文单词..."
          value="${state === 'unanswered' ? savedAnswer : ''}"
          ${state !== 'unanswered' ? 'disabled' : ''}
          autocomplete="off" autocapitalize="off" spellcheck="false">
        ${state === 'unanswered'
          ? `<button class="btn btn-primary mt-2" id="spelling-submit">确认</button>`
          : ''
        }
        ${state !== 'unanswered'
          ? `<div style="margin-top:12px;">
              ${state === 'wrong'
                ? `<span style="color:var(--color-danger);text-decoration:line-through;">${escapeHtml(savedAnswer)}</span> → `
                : ''}
              <span style="color:var(--color-success);font-weight:700;font-size:var(--fs-xl);">${q.answer}</span>
            </div>`
          : ''
        }
      </div>
    `;
  }

  function renderListening(q, state) {
    const savedAnswer = answers[currentIndex];
    return `
      <div style="text-align:center;">
        <button class="listening-play-btn" id="listen-btn" title="播放发音">🔊</button>
        <div style="margin-top:16px;color:var(--color-text-muted);font-size:var(--fs-sm);">点击按钮播放发音</div>
        ${renderOptions(q, state)}
      </div>
    `;
  }

  function renderFeedback(q, state) {
    if (state === 'correct') {
      return `<div class="quiz-feedback correct">✓ 回答正确！</div>`;
    }
    const explanations = {
      'en-to-zh': `正确答案是「${q.answer}」`,
      'spelling': `正确答案是「${q.answer}」`,
      'listening': `正确答案是「${q.answer}」`,
      'grammar': `正确答案是「${q.answer}」${q.explanation ? ' — ' + q.explanation : ''}`,
    };
    return `<div class="quiz-feedback wrong">✗ ${explanations[q.type] || '回答错误'}${q.explanation ? ' — ' + q.explanation : ''}</div>`;
  }

  function bindEvents(q) {
    // Option buttons
    container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (questionState[currentIndex] !== 'unanswered') return;
        const answer = btn.dataset.answer;
        answers[currentIndex] = answer;
        questionState[currentIndex] = answer === q.answer ? 'correct' : 'wrong';
        renderQuestion();
      });
    });

    // Spelling submit
    const spellingSubmit = container.querySelector('#spelling-submit');
    if (spellingSubmit) {
      spellingSubmit.addEventListener('click', () => {
        const input = container.querySelector('#spelling-input');
        const answer = input.value.trim();
        answers[currentIndex] = answer;
        questionState[currentIndex] = answer.toLowerCase() === q.answer.toLowerCase() ? 'correct' : 'wrong';
        renderQuestion();
      });
    }

    // Spelling input Enter key
    const spellingInput = container.querySelector('#spelling-input');
    if (spellingInput) {
      spellingInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const answer = spellingInput.value.trim();
          answers[currentIndex] = answer;
          questionState[currentIndex] = answer.toLowerCase() === q.answer.toLowerCase() ? 'correct' : 'wrong';
          renderQuestion();
        }
      });
    }

    // Listen button
    const listenBtn = container.querySelector('#listen-btn');
    if (listenBtn) {
      listenBtn.addEventListener('click', async () => {
        listenBtn.textContent = '⏳';
        try {
          await tts.speakWord(q.word);
        } catch { /* ignore */ }
        listenBtn.textContent = '🔊';
      });
    }

    // Navigation
    const prevBtn = container.querySelector('#quiz-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          renderQuestion();
        }
      });
    }

    const nextBtn = container.querySelector('#quiz-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentIndex < questions.length - 1) {
          currentIndex++;
          renderQuestion();
        }
      });
    }

    const finishBtn = container.querySelector('#quiz-finish');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        const total = questions.length;
        const correct = questionState.filter(s => s === 'correct').length;
        const results = questions.map((q, i) => ({
          ...q,
          userAnswer: answers[i] || '',
          isCorrect: questionState[i] === 'correct',
        }));
        if (onComplete) {
          onComplete({ total, correct, score: Math.round((correct / total) * 100), results });
        }
      });
    }
  }

  // Initial render
  renderQuestion();

  return {
    element: container,
    getProgress: () => ({
      current: currentIndex,
      total: questions.length,
      answered: questionState.filter(s => s !== 'unanswered').length,
      correct: questionState.filter(s => s === 'correct').length,
    }),
    goTo: (index) => {
      if (index >= 0 && index < questions.length) {
        currentIndex = index;
        renderQuestion();
      }
    },
  };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
