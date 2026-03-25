(function () {
  'use strict';

  const API = (typeof API_BASE !== 'undefined') ? API_BASE : 'http://localhost:8080/api';

  // 이미 로그인 상태면 대시보드로 이동
  if (localStorage.getItem('token')) {
    location.replace('index.html');
    return;
  }

  /* ── 탭 전환 ── */
  const tabs   = document.querySelectorAll('.auth-tab');
  const panels = document.querySelectorAll('.auth-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(tab.getAttribute('aria-controls')).classList.add('active');
    });
  });

  /* ── 공통: 에러 표시 ── */
  function showError(id, msg) {
    document.getElementById(id).textContent = msg;
  }
  function clearError(id) {
    document.getElementById(id).textContent = '';
  }

  /* ── 로그인 폼 ── */
  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('login-error');

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('btn-login');

    if (!email || !password) {
      showError('login-error', '이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    btn.disabled = true;
    btn.textContent = '로그인 중...';

    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError('login-error', data.error || '로그인에 실패했습니다.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);
      location.replace('index.html');
    } catch (_) {
      showError('login-error', '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해 주세요.');
    } finally {
      btn.disabled = false;
      btn.textContent = '로그인';
    }
  });

  /* ── 회원가입 폼 ── */
  document.getElementById('form-register').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('register-error');

    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const btn      = document.getElementById('btn-register');

    if (!email || !password) {
      showError('register-error', '이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      showError('register-error', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    btn.disabled = true;
    btn.textContent = '처리 중...';

    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError('register-error', data.error || '회원가입에 실패했습니다.');
        return;
      }

      // 회원가입 성공 → 자동 로그인
      const loginRes  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();

      localStorage.setItem('token', loginData.token);
      localStorage.setItem('userEmail', loginData.user.email);
      location.replace('index.html');
    } catch (_) {
      showError('register-error', '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해 주세요.');
    } finally {
      btn.disabled = false;
      btn.textContent = '회원가입';
    }
  });

})();
