(function () {
  'use strict';

  const API = 'http://localhost:8080/api';

  /* ── 인증 확인 ── */
  const token = localStorage.getItem('token');
  if (!token) {
    location.replace('login.html');
    return;
  }

  // 네비게이션 이메일 표시
  const emailEl = document.getElementById('nav-email');
  if (emailEl) emailEl.textContent = localStorage.getItem('userEmail') || '';

  /* ── 로그아웃 ── */
  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    location.replace('login.html');
  });

  /* ── 공통 fetch (Authorization 헤더 자동 포함) ── */
  function apiFetch(path, options = {}) {
    return fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  }

  /* ── 날짜 포맷 ── */
  function formatDate(isoStr) {
    const d = new Date(isoStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  function formatTime(isoStr) {
    const d = new Date(isoStr);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function toDateKey(isoStr) {
    // "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DD"
    return isoStr.slice(0, 10);
  }

  /* ── 클립 카드 HTML 생성 ── */
  function buildCard(clip) {
    const thumbHtml = clip.thumbnail
      ? `<img class="clip-thumbnail" src="${escHtml(clip.thumbnail)}" alt="" loading="lazy" onerror="this.parentNode.replaceChild(makePlaceholder(),this)" />`
      : `<div class="clip-thumbnail-placeholder" aria-hidden="true">📄</div>`;

    const hasMemo = clip.memo && clip.memo.trim() !== '';
    const memoVal = clip.memo || '';

    return `
      <article class="clip-card" data-id="${clip.id}">
        ${thumbHtml}
        <div class="clip-body">
          ${clip.source ? `<p class="clip-source">${escHtml(clip.source)}</p>` : ''}
          <p class="clip-title">
            <a href="${escHtml(clip.url)}" target="_blank" rel="noopener noreferrer">
              ${escHtml(clip.title || clip.url)}
            </a>
          </p>
          ${clip.summary ? `<p class="clip-summary">${escHtml(clip.summary)}</p>` : ''}
          <div class="clip-footer">
            <time class="clip-time" datetime="${escHtml(clip.clipped_at)}">${formatTime(clip.clipped_at)}</time>
            <div class="clip-actions">
              <button class="btn-memo-toggle ${hasMemo ? 'has-memo' : ''}" data-id="${clip.id}" aria-expanded="${hasMemo}" aria-label="메모 ${hasMemo ? '보기' : '추가'}">
                ✏️ 메모${hasMemo ? ' •' : ''}
              </button>
              <button class="btn-delete" data-id="${clip.id}" aria-label="클립 삭제">삭제</button>
            </div>
          </div>
          <div class="memo-area ${hasMemo ? 'is-open' : ''}" data-id="${clip.id}">
            <textarea
              class="memo-textarea"
              data-id="${clip.id}"
              data-saved="${escHtml(memoVal)}"
              placeholder="이 뉴스에 대한 생각, 면접 답변 키워드 등을 메모해 보세요..."
              maxlength="2000"
              aria-label="메모 입력"
            >${escHtml(memoVal)}</textarea>
            <div class="memo-footer">
              <span class="memo-status" data-id="${clip.id}"></span>
              <span class="memo-length" data-id="${clip.id}">${memoVal.length}/2000</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // onerror 폴백용 전역 함수
  window.makePlaceholder = function () {
    const el = document.createElement('div');
    el.className = 'clip-thumbnail-placeholder';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = '📄';
    return el;
  };

  /* ── 클립 목록 렌더링 ── */
  const listEl     = document.getElementById('clips-list');
  const loadingEl  = document.getElementById('state-loading');
  const emptyEl    = document.getElementById('state-empty');
  const countEl    = document.getElementById('clip-count');

  function renderClips(clips) {
    loadingEl.style.display = 'none';

    if (clips.length === 0) {
      listEl.hidden = true;
      emptyEl.hidden = false;
      countEl.textContent = '';
      return;
    }

    emptyEl.hidden = true;
    listEl.hidden  = false;

    // 날짜별 그룹핑
    const groups = {};
    clips.forEach((c) => {
      const key = toDateKey(c.clipped_at);
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });

    const html = Object.entries(groups).map(([date, items]) => {
      const label = formatDate(date + 'T00:00:00');
      const cards = items.map(buildCard).join('');
      return `
        <div class="date-group">
          <div class="date-group-header">
            ${label}
            <span class="date-group-count">${items.length}개</span>
          </div>
          ${cards}
        </div>
      `;
    }).join('');

    listEl.innerHTML = html;
    countEl.textContent = `총 ${clips.length}개의 클립`;

    // 삭제 버튼 이벤트
    listEl.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', () => deleteClip(Number(btn.dataset.id)));
    });

    // 메모 토글 버튼 이벤트
    listEl.querySelectorAll('.btn-memo-toggle').forEach((btn) => {
      btn.addEventListener('click', () => toggleMemo(Number(btn.dataset.id)));
    });

    // 메모 자동저장 (blur) + 글자수 카운터
    // data-saved 와 다를 때만 저장 → 열자마자 blur 발동으로 인한 오발사 방지
    listEl.querySelectorAll('.memo-textarea').forEach((ta) => {
      ta.addEventListener('input', () => updateMemoLength(ta));
      ta.addEventListener('blur', () => {
        if (ta.value !== ta.dataset.saved) {
          saveMemo(Number(ta.dataset.id), ta.value);
        }
      });
    });
  }

  /* ── 클립 목록 로드 ── */
  async function loadClips(date) {
    loadingEl.style.display = 'block';
    listEl.hidden = true;
    emptyEl.hidden = true;

    try {
      const url = date ? `/clips?date=${date}` : '/clips';
      const res  = await apiFetch(url);

      if (res.status === 401) {
        localStorage.removeItem('token');
        location.replace('login.html');
        return;
      }

      const clips = await res.json();
      renderClips(clips);
    } catch (_) {
      loadingEl.style.display = 'none';
      listEl.hidden = false;
      listEl.innerHTML = '<p style="color:var(--danger);padding:20px 0">클립을 불러오지 못했습니다. 서버 연결을 확인해 주세요.</p>';
    }
  }

  /* ── 클립 저장 ── */
  const urlInput = document.getElementById('url-input');
  const btnClip  = document.getElementById('btn-clip');
  const clipError = document.getElementById('clip-error');

  btnClip.addEventListener('click', saveClip);
  urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveClip(); });

  async function saveClip() {
    const url = urlInput.value.trim();
    clipError.textContent = '';

    if (!url) {
      clipError.textContent = 'URL을 입력해 주세요.';
      urlInput.focus();
      return;
    }

    try { new URL(url); }
    catch (_) {
      clipError.textContent = '올바른 URL 형식이 아닙니다. (예: https://...)';
      urlInput.focus();
      return;
    }

    btnClip.classList.add('is-loading');
    btnClip.disabled = true;

    try {
      const res  = await apiFetch('/clips', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        clipError.textContent = data.error || '저장에 실패했습니다.';
        return;
      }

      urlInput.value = '';
      // 날짜 필터가 적용된 상태면 필터 기준 재조회, 아니면 전체 재조회
      const dateFilter = document.getElementById('date-filter').value;
      await loadClips(dateFilter || null);
    } catch (_) {
      clipError.textContent = '서버에 연결할 수 없습니다.';
    } finally {
      btnClip.classList.remove('is-loading');
      btnClip.disabled = false;
    }
  }

  /* ── 메모 토글 ── */
  function toggleMemo(id) {
    const area = listEl.querySelector(`.memo-area[data-id="${id}"]`);
    const btn  = listEl.querySelector(`.btn-memo-toggle[data-id="${id}"]`);
    if (!area) return;

    const opening = !area.classList.contains('is-open');
    area.classList.toggle('is-open', opening);
    btn.setAttribute('aria-expanded', opening);

    if (opening) {
      // CSS 슬라이드 애니메이션(250ms) 완료 후 포커스
      // → 애니메이션 도중 blur 발동으로 인한 오발사 방지
      const ta = area.querySelector('.memo-textarea');
      if (ta) setTimeout(() => ta.focus(), 260);
    }
  }

  /* ── 메모 글자수 업데이트 ── */
  function updateMemoLength(ta) {
    const lenEl = listEl.querySelector(`.memo-length[data-id="${ta.dataset.id}"]`);
    if (lenEl) lenEl.textContent = `${ta.value.length}/2000`;
  }

  /* ── 메모 저장 ── */
  const memoTimers = {};

  async function saveMemo(id, memo) {
    // 디바운스: 마지막 blur 후 300ms 뒤 저장
    clearTimeout(memoTimers[id]);
    memoTimers[id] = setTimeout(async () => {
      const statusEl = listEl.querySelector(`.memo-status[data-id="${id}"]`);
      const toggleBtn = listEl.querySelector(`.btn-memo-toggle[data-id="${id}"]`);

      if (statusEl) { statusEl.textContent = '저장 중...'; statusEl.className = 'memo-status saving'; }

      try {
        const res = await apiFetch(`/clips/${id}/memo`, {
          method: 'PATCH',
          body: JSON.stringify({ memo: memo.trim() || null }),
        });

        if (!res.ok) {
          if (statusEl) { statusEl.textContent = '저장 실패'; statusEl.className = 'memo-status error'; }
          return;
        }

        if (statusEl) {
          statusEl.textContent = '저장됨 ✓';
          statusEl.className = 'memo-status saved';
          setTimeout(() => { statusEl.textContent = ''; statusEl.className = 'memo-status'; }, 2000);
        }

        // 저장 완료 → data-saved 갱신 (다음 blur 시 재저장 방지)
        const ta = listEl.querySelector(`.memo-textarea[data-id="${id}"]`);
        if (ta) ta.dataset.saved = memo.trim();

        // 메모 존재 여부에 따라 토글 버튼 스타일 갱신
        if (toggleBtn) {
          const hasMemo = memo.trim() !== '';
          toggleBtn.classList.toggle('has-memo', hasMemo);
          toggleBtn.textContent = `✏️ 메모${hasMemo ? ' •' : ''}`;
        }
      } catch (_) {
        if (statusEl) { statusEl.textContent = '저장 실패'; statusEl.className = 'memo-status error'; }
      }
    }, 300);
  }

  /* ── 클립 삭제 ── */
  async function deleteClip(id) {
    if (!confirm('이 클립을 삭제할까요?')) return;

    try {
      const res = await apiFetch(`/clips/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('삭제에 실패했습니다.');
        return;
      }
      const dateFilter = document.getElementById('date-filter').value;
      await loadClips(dateFilter || null);
    } catch (_) {
      alert('서버에 연결할 수 없습니다.');
    }
  }

  /* ── 날짜 필터 ── */
  document.getElementById('date-filter').addEventListener('change', (e) => {
    loadClips(e.target.value || null);
  });

  document.getElementById('btn-filter-clear').addEventListener('click', () => {
    document.getElementById('date-filter').value = '';
    loadClips(null);
  });

  /* ── 초기 로드 ── */
  loadClips(null);

})();
