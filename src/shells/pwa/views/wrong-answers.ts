/**
 * Wrong Answers Review — shows all incorrectly answered questions,
 * grouped by topic. Mark as reviewed to clear. Pack-agnostic.
 */

import type { StudyProgress, WrongAnswer } from '../components/study-progress.js';

export async function renderWrongAnswers(
  progress: StudyProgress,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '';

  const wrong = await progress.getWrongAnswers();
  const unreviewed = wrong.filter(w => !w.reviewedAt);

  const header = document.createElement('div');
  header.className = 'wrong-header';
  header.innerHTML = `
    <h2 class="wrong-title">\u274C Wrong Answers Review</h2>
    <p class="wrong-subtitle">${unreviewed.length} to review \u00B7 ${wrong.length} total</p>
  `;

  if (unreviewed.length > 0) {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'wrong-clear-btn';
    clearBtn.textContent = 'Clear All Reviewed';
    clearBtn.addEventListener('click', async () => {
      await progress.clearReviewed();
      renderWrongAnswers(progress, container);
    });
    header.appendChild(clearBtn);
  }

  container.appendChild(header);

  if (unreviewed.length === 0) {
    container.innerHTML += '<div class="dash-empty"><p>\u{1F389} No wrong answers to review! Keep practicing.</p></div>';
    return;
  }

  // Group by topic
  const byTopic = new Map<string, WrongAnswer[]>();
  for (const w of unreviewed) {
    const key = `${w.subject} — ${w.topic}`;
    if (!byTopic.has(key)) byTopic.set(key, []);
    byTopic.get(key)!.push(w);
  }

  for (const [topic, items] of byTopic) {
    const section = document.createElement('div');
    section.className = 'wrong-topic-section';

    const topicHeader = document.createElement('h3');
    topicHeader.className = 'wrong-topic-title';
    topicHeader.textContent = `${topic} (${items.length})`;
    section.appendChild(topicHeader);

    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'wrong-card';
      card.innerHTML = `
        <div class="wrong-question">${esc(item.question)}</div>
        <div class="wrong-your-answer">Your answer: <span class="wrong-bad">${esc(item.userAnswer)}</span></div>
        <div class="wrong-correct-answer">Correct: <span class="wrong-good">${esc(item.correctAnswer)}</span></div>
        ${item.solutionSteps ? `<ol class="wrong-steps">${item.solutionSteps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
        <div class="wrong-meta">${new Date(item.timestamp).toLocaleDateString()} \u00B7 ${item.source}</div>
      `;

      const reviewBtn = document.createElement('button');
      reviewBtn.className = 'wrong-review-btn';
      reviewBtn.textContent = '\u2713 Mark Reviewed';
      reviewBtn.addEventListener('click', async () => {
        await progress.markReviewed(item.id);
        card.classList.add('wrong-reviewed');
        reviewBtn.disabled = true;
        reviewBtn.textContent = 'Reviewed';
      });
      card.appendChild(reviewBtn);

      section.appendChild(card);
    }

    container.appendChild(section);
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
