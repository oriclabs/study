/**
 * Flashcards — formula and vocabulary cards with spaced repetition.
 * Auto-extracted from notes data. Flip to reveal, rate difficulty.
 */

import type { ContentPackManager } from '../components/content-packs.js';
import type { StorageAdapter } from '@platform/types.js';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  subject: string;
}

interface CardProgress {
  id: string;
  box: number; // 0-4 (SR boxes)
  nextReview: number; // timestamp
  lastReview: number;
}

const BOX_INTERVALS = [0, 1, 3, 7, 14]; // days

export async function renderFlashcards(
  packManager: ContentPackManager,
  storage: StorageAdapter,
  container: HTMLElement,
): Promise<void> {
  container.innerHTML = '<div class="notes-loading">Loading flashcards...</div>';

  // Extract flashcards from all pack notes
  const cards: Flashcard[] = [];
  const packs = await packManager.listPacks();

  for (const pack of packs) {
    for (const subj of pack.subjects) {
      if (!subj.hasNotes) continue;
      const notes = await packManager.loadNotes(pack.packId, subj.id);
      if (!notes) continue;

      const data = notes as Record<string, unknown>;
      for (const cat of ((data['categories'] as any[]) || [])) {
        for (const topic of (cat.topics || [])) {
          // Extract formulas
          for (const key of ['key_formulas', 'formulas', 'formula', 'key_formula', 'basic_formula', 'fundamental_formula', 'derived_formulas', 'key_equation']) {
            const val = topic[key];
            if (typeof val === 'string') {
              cards.push({ id: `fc-${cards.length}`, front: topic.title || 'Formula', back: val, category: 'Formula', subject: subj.label });
            } else if (Array.isArray(val)) {
              for (const item of val) {
                if (typeof item === 'string') {
                  cards.push({ id: `fc-${cards.length}`, front: `${topic.title}: Formula`, back: item, category: 'Formula', subject: subj.label });
                }
              }
            }
          }
          // Extract key rules
          for (const key of ['key_rules', 'key_notes', 'golden_rule', 'golden_rules', 'key_principle']) {
            const val = topic[key];
            if (typeof val === 'string') {
              cards.push({ id: `fc-${cards.length}`, front: `${topic.title}: Key Rule`, back: val, category: 'Rule', subject: subj.label });
            } else if (Array.isArray(val)) {
              for (const item of val) {
                if (typeof item === 'string' && item.length < 150) {
                  cards.push({ id: `fc-${cards.length}`, front: `${topic.title}: Key Point`, back: item, category: 'Rule', subject: subj.label });
                }
              }
            }
          }
          // Extract definitions
          if (topic.definitions && typeof topic.definitions === 'object') {
            for (const [term, def] of Object.entries(topic.definitions as Record<string, string>)) {
              if (typeof def === 'string') {
                cards.push({ id: `fc-${cards.length}`, front: `Define: ${term}`, back: def, category: 'Definition', subject: subj.label });
              }
            }
          }
        }
      }
    }
  }

  container.innerHTML = '';

  if (cards.length === 0) {
    container.innerHTML = '<div class="placeholder"><p>No flashcards available. Import a content pack with study notes.</p></div>';
    return;
  }

  // Load progress
  const progressMap = new Map<string, CardProgress>();
  const saved = await storage.get<CardProgress[]>('flashcards.progress') ?? [];
  for (const p of saved) progressMap.set(p.id, p);

  // Header
  const header = document.createElement('div');
  header.className = 'fc-header';

  const dueCards = cards.filter(c => {
    const p = progressMap.get(c.id);
    return !p || p.nextReview <= Date.now();
  });

  header.innerHTML = `
    <h2 class="fc-title">\u{1F4DA} Flashcards</h2>
    <p class="fc-subtitle">${cards.length} cards total \u00B7 ${dueCards.length} due for review</p>
  `;

  // Filter
  const filterRow = document.createElement('div');
  filterRow.className = 'fc-filter';
  const categories = [...new Set(cards.map(c => c.category))];
  const subjects = [...new Set(cards.map(c => c.subject))];

  const catSelect = document.createElement('select');
  catSelect.className = 'gen-select';
  catSelect.innerHTML = '<option value="all">All categories</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');

  const subjSelect = document.createElement('select');
  subjSelect.className = 'gen-select';
  subjSelect.innerHTML = '<option value="all">All subjects</option>' + subjects.map(s => `<option value="${s}">${s}</option>`).join('');

  const dueOnlyCheck = document.createElement('label');
  dueOnlyCheck.className = 'fc-due-label';
  dueOnlyCheck.innerHTML = '<input type="checkbox" id="fc-due-only" checked> Due only';

  filterRow.appendChild(catSelect);
  filterRow.appendChild(subjSelect);
  filterRow.appendChild(dueOnlyCheck);
  header.appendChild(filterRow);
  container.appendChild(header);

  // Card area
  const cardArea = document.createElement('div');
  cardArea.className = 'fc-card-area';
  container.appendChild(cardArea);

  let deck: Flashcard[] = [];
  let deckIdx = 0;
  let flipped = false;

  function buildDeck() {
    const cat = catSelect.value;
    const subj = subjSelect.value;
    const dueOnly = (document.getElementById('fc-due-only') as HTMLInputElement)?.checked ?? true;

    deck = cards.filter(c =>
      (cat === 'all' || c.category === cat) &&
      (subj === 'all' || c.subject === subj) &&
      (!dueOnly || !progressMap.has(c.id) || progressMap.get(c.id)!.nextReview <= Date.now())
    );
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j]!,deck[i]!]; }
    deckIdx = 0;
    flipped = false;
    showCard();
  }

  function showCard() {
    cardArea.innerHTML = '';
    if (deck.length === 0) {
      cardArea.innerHTML = '<div class="fc-done">\u{1F389} All cards reviewed! Come back later.</div>';
      return;
    }
    if (deckIdx >= deck.length) {
      cardArea.innerHTML = '<div class="fc-done">\u{2705} Deck complete! ' + deckIdx + ' cards reviewed.</div>';
      return;
    }

    const card = deck[deckIdx]!;
    const cardEl = document.createElement('div');
    cardEl.className = 'fc-card' + (flipped ? ' fc-card-flipped' : '');

    const front = document.createElement('div');
    front.className = 'fc-front';
    front.innerHTML = `<div class="fc-card-cat">${esc(card.category)} \u00B7 ${esc(card.subject)}</div><div class="fc-card-text">${esc(card.front)}</div><div class="fc-card-hint">Tap to flip</div>`;

    const back = document.createElement('div');
    back.className = 'fc-back';
    back.innerHTML = `<div class="fc-card-cat">${esc(card.category)}</div><div class="fc-card-text">${esc(card.back)}</div>`;

    cardEl.appendChild(front);
    cardEl.appendChild(back);

    cardEl.addEventListener('click', () => {
      flipped = !flipped;
      cardEl.classList.toggle('fc-card-flipped', flipped);
    });

    cardArea.appendChild(cardEl);

    // Rating buttons (shown after flip)
    const ratingRow = document.createElement('div');
    ratingRow.className = 'fc-rating';
    ratingRow.innerHTML = '<p class="fc-rating-label">How well did you know this?</p>';

    const ratings = [
      { label: 'Again', box: 0, cls: 'fc-rate-again' },
      { label: 'Hard', box: 1, cls: 'fc-rate-hard' },
      { label: 'Good', box: 2, cls: 'fc-rate-good' },
      { label: 'Easy', box: 3, cls: 'fc-rate-easy' },
    ];

    for (const r of ratings) {
      const btn = document.createElement('button');
      btn.className = `fc-rate-btn ${r.cls}`;
      btn.textContent = r.label;
      btn.addEventListener('click', async () => {
        const existing = progressMap.get(card.id);
        const newBox = Math.min(4, r.box);
        const nextReview = Date.now() + BOX_INTERVALS[newBox]! * 86400000;
        const prog: CardProgress = { id: card.id, box: newBox, nextReview, lastReview: Date.now() };
        progressMap.set(card.id, prog);
        await storage.set('flashcards.progress', [...progressMap.values()]);
        deckIdx++;
        flipped = false;
        showCard();
      });
      ratingRow.appendChild(btn);
    }

    cardArea.appendChild(ratingRow);

    // Progress
    const progEl = document.createElement('div');
    progEl.className = 'fc-progress';
    progEl.textContent = `${deckIdx + 1} / ${deck.length}`;
    cardArea.appendChild(progEl);
  }

  catSelect.addEventListener('change', buildDeck);
  subjSelect.addEventListener('change', buildDeck);
  dueOnlyCheck.querySelector('input')?.addEventListener('change', buildDeck);

  buildDeck();
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
