/**
 * 訪問控制系統 - 三層級權限管理
 * guest (訪客) < viewer (檢視者) < admin (管理員)
 */

const ACCESS_CONTROL = {
  PASSWORD_KEY: 'hlc_authenticated',
  USER_TYPE_KEY: 'hlc_user_type',
  ROLE_PERMISSIONS_KEY: 'hlc_role_permissions',
  
  // 預設身份權限
  DEFAULT_PERMISSIONS: {
    'guest': ['index.html', 'about.html'],
    'viewer': ['index.html', 'search.html','about.html', 'touchdesigner.html','performance-records.html','arduino-sensor.html', 'cloud-dreams.html','maxmsp.html','projects.html'],
    'admin': ['index.html', 'search.html','about.html', 'touchdesigner.html','performance-records.html','arduino-sensor.html', 'portfolio.html', 'projects.html','maxmsp.html', 'cloud-dreams.html']
  },

  // 標記為還未完成的頁面（對非管理員隱藏）
  INCOMPLETE_PAGES: [
    'portfolio.html', 
    'sound-map.html',
    'studio-notes.html',
    'signal-translation.html',
    'mechanical-garden.html',
    'sound-art.html',
    'sensor-interactive.html',
    'physical-computing.html',
    'visual-experiment.html',
    'exhibition-history.html',
    'conducting.html',
    'zither-performance.html',
    'percussion.html',
    'chorus-accompaniment.html',
    'instrument-teaching.html',
    'music-theory.html',
    'band-assistant.html',
    'sound-synthesis.html',
    'visual-design.html',
    'interactive-art.html',
    'multimedia-production.html',
    'resume.html'
  ],

  // 獲取權限設置（從 localStorage 或使用預設值）
  getRolePermissions() {
    const saved = localStorage.getItem(this.ROLE_PERMISSIONS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return this.DEFAULT_PERMISSIONS;
  },

  // 初始化訪問控制
  init() {
    this.checkAccess();
    this.setupLoginButton();
  },

  // 獲取當前頁面名稱
  getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  },

  // 檢查用戶是否已登入
  isAuthenticated() {
    return localStorage.getItem(this.PASSWORD_KEY) === 'true';
  },

  // 獲取用戶身份
  getUserType() {
    return localStorage.getItem(this.USER_TYPE_KEY) || 'guest';
  },

  // 檢查用戶是否是管理員
  isAdmin() {
    return this.getUserType() === 'admin';
  },

  // 檢查用戶是否是檢視者或以上
  isViewer() {
    const type = this.getUserType();
    return type === 'viewer' || type === 'admin';
  },

  // 檢查特定頁面是否可訪問
  canAccessPage(page, userType) {
    const permissions = this.getRolePermissions();
    const allowedPages = permissions[userType] || [];
    return allowedPages.includes(page);
  },

  // 檢查頁面是否未完成（非管理員隱藏）
  // 但如果當前用戶被授予該頁面權限，則不視為未完成
  isPageIncomplete(page) {
    if (!this.INCOMPLETE_PAGES.includes(page)) {
      return false; // 頁面不在未完成列表中
    }
    
    if (this.isAdmin()) {
      return false; // 管理員可以看所有頁面
    }
    
    // 非管理員：檢查是否被授予該頁面權限
    const userType = this.getUserType();
    const permissions = this.getRolePermissions();
    const allowedPages = permissions[userType] || [];
    
    // 如果用戶被授予該頁面權限，就不視為未完成
    return !allowedPages.includes(page);
  },

  // 顯示「需要更高權限」提示
  showPermissionDeniedOverlay() {
    // 移除已有的覆蓋層
    const existing = document.getElementById('permission-denied-overlay');
    if (existing) {
      existing.remove();
    }

    // 防止頁面滾動
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const overlay = document.createElement('div');
    overlay.id = 'permission-denied-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      pointer-events: auto;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 40px;
      max-width: 450px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
    `;

    const icon = document.createElement('div');
    icon.textContent = '';
    icon.style.cssText = 'font-size: 48px; margin-bottom: 20px;';

    const title = document.createElement('h2');
    title.textContent = '需要更高權限';
    title.style.cssText = 'margin: 0 0 12px 0; color: #333; font-size: 24px;';

    const message = document.createElement('p');
    message.textContent = '您的權限不足，無法訪問此頁面。';
    message.style.cssText = 'margin: 0 0 30px 0; color: #666; font-size: 14px; line-height: 1.6;';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center;';

    const backBtn = document.createElement('button');
    backBtn.textContent = '← 返回首頁';
    backBtn.style.cssText = `
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      background: #f0f0f0;
      color: #333;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    `;
    backBtn.onmouseover = () => backBtn.style.background = '#e0e0e0';
    backBtn.onmouseout = () => backBtn.style.background = '#f0f0f0';
    backBtn.onclick = () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.location.href = './index.html';
    };

    const upgradeBtn = document.createElement('button');
    upgradeBtn.textContent = '升級權限';
    upgradeBtn.style.cssText = `
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      background: #ffb6c1;
      color: white;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    `;
    upgradeBtn.onmouseover = () => upgradeBtn.style.background = '#ff9fb5';
    upgradeBtn.onmouseout = () => upgradeBtn.style.background = '#ffb6c1';
    upgradeBtn.onclick = () => {
      sessionStorage.setItem('loginReferrer', window.location.href);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.location.href = './login.html';
    };

    buttonContainer.appendChild(backBtn);
    buttonContainer.appendChild(upgradeBtn);

    dialog.appendChild(icon);
    dialog.appendChild(title);
    dialog.appendChild(message);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  },

  // 檢查訪問權限
  checkAccess() {
    const currentPage = this.getCurrentPage();
    const userType = this.getUserType();

    // 登入頁面始終可訪問
    if (currentPage === 'login.html') {
      return;
    }

    // 管理後台只有管理員才能訪問
    if (currentPage === 'admin.html') {
      if (userType !== 'admin') {
        window.location.href = './index.html';
      }
      return;
    }

    // 檢查頁面是否未完成（對非管理員隱藏）
    if (this.isPageIncomplete(currentPage)) {
      document.body.style.overflow = 'hidden';
      this.showPermissionDeniedOverlay();
      return;
    }

    // 檢查是否有權訪問該頁面
    if (!this.canAccessPage(currentPage, userType)) {
      // 無權訪問，保存想要的頁面並重定向到登入
      sessionStorage.setItem('loginReferrer', window.location.href);
      window.location.href = './login.html';
    }
  },

  // 設置登入/登出按鈕和管理菜單
  setupLoginButton() {
    const isAuthenticated = this.isAuthenticated();
    const userType = this.getUserType();
    const currentPage = this.getCurrentPage();
    
    // 如果在登入頁或管理頁，不顯示按鈕
    if (currentPage === 'login.html' || currentPage === 'admin.html') {
      return;
    }

    // 尋找是否有登入按鈕容器
    let loginContainer = document.getElementById('login-button-container');
    
    if (loginContainer) {
      // 未登入或訪客：顯示登入
      if (!isAuthenticated || userType === 'guest') {
        loginContainer.innerHTML = `
          <a href="./login.html" class="nav-link login-btn" title="登入">登入</a>
        `;
      } else if (userType === 'admin') {
        // 管理員：顯示管理後台和登出
        loginContainer.innerHTML = `
          <div class="authenticated-menu">
            <a href="./admin.html" class="nav-link admin-btn" title="管理後台">管理後台</a>
            <button class="nav-link logout-link" id="logoutBtn" title="登出">登出</button>
          </div>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
          if (confirm('確定要登出嗎？')) {
            localStorage.removeItem(this.PASSWORD_KEY);
            localStorage.removeItem(this.USER_TYPE_KEY);
            window.location.href = './index.html';
          }
        });
      } else if (userType === 'viewer') {
        // 檢視者：只顯示登出
        loginContainer.innerHTML = `
          <div class="authenticated-menu">
            <button class="nav-link logout-link" id="logoutBtn" title="登出">登出</button>
          </div>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
          if (confirm('確定要登出嗎？')) {
            localStorage.removeItem(this.PASSWORD_KEY);
            localStorage.removeItem(this.USER_TYPE_KEY);
            window.location.href = './index.html';
          }
        });
      }
    }
  },

  // 登出
  logout() {
    localStorage.removeItem(this.PASSWORD_KEY);
    localStorage.removeItem(this.USER_TYPE_KEY);
    window.location.href = './index.html';
  }
};

// 頁面加載時初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ACCESS_CONTROL.init();
  });
} else {
  ACCESS_CONTROL.init();
}
