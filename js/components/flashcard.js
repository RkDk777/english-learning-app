import { tts } from '../utils/tts.js';

/**
 * Flashcard component — renders an interactive flip card for a word
 */
export function createFlashcard(word, onKnow, onDunno) {
  const container = document.createElement('div');
  container.className = 'flashcard-container';
  container.innerHTML = `
    <div class="flashcard">
      <div class="flashcard-face flashcard-front">
        <div class="flashcard-word">${word.en}</div>
        <div class="flashcard-phonetic">${word.phonetic || ''}</div>
        <button class="flashcard-speak-btn" title="听发音">🔊</button>
      </div>
      <div class="flashcard-face flashcard-back">
        <div class="flashcard-meaning">${word.zh}</div>
        <div class="flashcard-pos">${word.pos || ''}</div>
        <div class="flashcard-example">${word.example || ''}</div>
        ${word.exampleZh ? `<div class="flashcard-example" style="color:var(--color-text-muted);margin-top:4px;">${word.exampleZh}</div>` : ''}
      </div>
    </div>
  `;

  const card = container.querySelector('.flashcard');
  const speakBtn = container.querySelector('.flashcard-speak-btn');

  // Flip on card click (but not on speak button)
  card.addEventListener('click', (e) => {
    if (e.target.closest('.flashcard-speak-btn')) return;
    card.classList.toggle('flipped');
  });

  // Speak button
  speakBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    speakBtn.textContent = '🔊';
    try {
      await tts.speakWord(word.en);
    } catch {
      // TTS failed silently
    }
    speakBtn.textContent = '🔊';
  });

  // Create action buttons
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'flashcard-actions';

  const dunnoBtn = document.createElement('button');
  dunnoBtn.className = 'flashcard-dunno-btn';
  dunnoBtn.textContent = '✗ 不认识';
  dunnoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onDunno) onDunno(word);
  });

  const knowBtn = document.createElement('button');
  knowBtn.className = 'flashcard-know-btn';
  knowBtn.textContent = '✓ 认识';
  knowBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (onKnow) onKnow(word);
  });

  actionsDiv.appendChild(dunnoBtn);
  actionsDiv.appendChild(knowBtn);

  const wrapper = document.createElement('div');
  wrapper.appendChild(container);
  wrapper.appendChild(actionsDiv);

  // Progress indicator
  const progressText = document.createElement('div');
  progressText.className = 'text-center text-muted mt-2';
  progressText.style.fontSize = 'var(--fs-sm)';
  wrapper.appendChild(progressText);

  return {
    element: wrapper,
    flip: () => card.classList.toggle('flipped'),
    isFlipped: () => card.classList.contains('flipped'),
    reset: () => card.classList.remove('flipped'),
    setProgress: (current, total) => {
      progressText.textContent = `${current} / ${total}`;
    },
  };
}
