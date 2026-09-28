<template>
  <div class="page">
    <div class="web-swing">
      <img :src="heroSwingImg" alt="" />
    </div>
    <div v-if="!isLoggedIn" class="login-screen">
      <div class="panel login-panel">
        <h1 class="title">HERO CLICKER</h1>
        <p class="tagline">Rejoins la bataille contre les vilains.</p>
        <input v-model="usernameInput" placeholder="Pseudo (écrire admin pour être admin)" />
        <button class="btn" @click="handleLogin">Entrer</button>
      </div>
    </div>

    <div v-else class="app">
      <header class="topbar panel">
        <nav class="nav">
          <router-link to="/" class="nav-link">Battre le vilain</router-link>
          <router-link to="/leaderboard" class="nav-link">Leaderboard</router-link>
        </nav>
        <div class="score">
          <span class="score-number">{{ Math.floor(cookies) }}</span>
          <span class="score-label">cookies — {{ autoProduction.toFixed(1) }}/s</span>
          <span class="score-label">Double : {{ Math.floor(doubleCookies) }}</span>
        </div>
        <div class="user-block">
          <span>{{ username }} <em>· {{ role }}</em></span>
          <button class="btn btn-ghost" @click="handleLogout">Quitter</button>
        </div>
      </header>

      <router-view />
    </div>
  </div>
</template>

<script>
import heroSwingImg from './assets/spiderman.png';

export default {
  name: 'App',
  data() {
    return { usernameInput: '', heroSwingImg };
  },
  computed: {
    cookies() {
      return this.$store.state.cookies.cookies;
    },
    autoProduction() {
      return this.$store.state.cookies.autoProduction;
    },
    doubleCookies() {
      return this.$store.getters['cookies/doubleCookies'];
    },
    username() {
      return this.$store.state.user.username;
    },
    role() {
      return this.$store.state.user.role;
    },
    isLoggedIn() {
      return this.$store.state.user.isLoggedIn;
    }
  },
  methods: {
    startAutoProduction() {
      this.$store.dispatch('cookies/startAutoProduction');
    },
    login(username) {
      this.$store.dispatch('user/login', username);
    },
    logout() {
      this.$store.dispatch('user/logout');
    },
    saveGame() {
      this.$store.dispatch('user/saveGame');
    },
    loadScores() {
      this.$store.dispatch('leaderboard/loadScores');
    },
    handleLogin() {
      const username = this.usernameInput.trim();
      if (username.length > 0) {
        this.login(username);
      }
    },
    handleLogout() {
      this.logout();
    }
  },
  mounted() {
    this.loadScores();
    this.startAutoProduction();
    setInterval(() => {
      if (this.isLoggedIn) {
        this.saveGame();
      }
    }, 5000);
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Space+Grotesk:wght@400;500;700&display=swap');

* {
  box-sizing: border-box;
}

:root {
  --paper: #f2e8d5;
  --ink: #1b1b1b;
  --blue: #2455a4;
  --red: #d6382e;
  --gold: #f2b705;
  --panel: #fffdf7;
}

body {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  color: var(--ink);
  background-color: var(--paper);
  background-image: radial-gradient(circle, rgba(27, 27, 27, 0.10) 1px, transparent 1.4px);
  background-size: 11px 11px;
  min-height: 100vh;
}

.page {
  position: relative;
  overflow-x: hidden;
  min-height: 100vh;
}

.web-swing {
  position: fixed;
  top: 38vh;
  left: 50%;
  width: 80px;
  transform-origin: top center;
  animation: swing 3.4s ease-in-out infinite alternate;
  opacity: 0.22;
  z-index: 0;
  pointer-events: none;
}

.web-swing img {
  width: 100%;
  display: block;
}

@keyframes swing {
  from {
    transform: translateX(-40vw) rotate(-16deg);
  }

  to {
    transform: translateX(32vw) rotate(16deg);
  }
}

.panel {
  background: var(--panel);
  border: 3px solid var(--ink);
  border-radius: 6px;
  box-shadow: 6px 6px 0 var(--ink);
  padding: 18px;
  position: relative;
  z-index: 1;
}

.login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-panel {
  max-width: 360px;
  text-align: center;
  transform: rotate(-1deg);
}

.title {
  font-family: 'Bangers', cursive;
  font-size: 2.8rem;
  color: var(--red);
  letter-spacing: 2px;
  margin: 0 0 4px;
}

.tagline {
  color: #555;
  margin-bottom: 18px;
}

.login-panel input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--ink);
  border-radius: 4px;
  margin-bottom: 12px;
  font-family: inherit;
  font-size: 0.95rem;
}

.app {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 28px auto;
  padding: 0 20px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
  transform: rotate(0.3deg);
}

.nav {
  display: flex;
  gap: 10px;
}

.nav-link {
  font-weight: 700;
  text-decoration: none;
  color: var(--ink);
  padding: 6px 14px;
  border: 2px solid var(--ink);
  border-radius: 6px;
  box-shadow: 3px 3px 0 var(--ink);
}

.nav-link.router-link-exact-active {
  background: var(--gold);
}

.user-block {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.user-block em {
  color: #777;
  font-style: normal;
}

.score {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
}

.score-number {
  font-family: 'Bangers', cursive;
  font-size: 2rem;
  color: var(--blue);
}

.score-label {
  font-size: 0.75rem;
  color: #777;
}

.board {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.click-panel {
  flex: 1.6;
  min-width: 380px;
  text-align: center;
  transform: rotate(-0.5deg);
  padding: 32px;
}

.villain-name {
  font-family: 'Bangers', cursive;
  font-size: 2.6rem;
  color: var(--red);
  margin: 0 0 10px;
  letter-spacing: 1px;
}

.health-bar {
  background: #e2d4b8;
  border: 2px solid var(--ink);
  border-radius: 20px;
  height: 18px;
  overflow: hidden;
  margin-bottom: 24px;
}

.health-fill {
  background: var(--red);
  height: 100%;
  transition: width 0.25s ease;
}

.villain-click {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: inline-block;
  transition: transform 0.08s ease;
}

.villain-click img {
  width: 340px;
  height: 340px;
  max-width: 90%;
  object-fit: contain;
  filter: drop-shadow(5px 8px 0 rgba(0, 0, 0, 0.25));
}

.villain-click:active {
  transform: scale(0.94) rotate(-2deg);
}

.team-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.team-icon {
  width: 46px;
  height: 46px;
  object-fit: contain;
  border: 2px solid var(--ink);
  border-radius: 50%;
  background: var(--paper);
}

.arrival {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--gold);
  border: 2px solid var(--ink);
  border-radius: 20px;
  padding: 7px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.arrival img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.arrive-enter-active,
.arrive-leave-active {
  transition: all 0.35s ease;
}

.arrive-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.arrive-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.shop-panel {
  flex: 1.2;
  min-width: 320px;
  transform: rotate(0.5deg);
  padding: 24px;
}

.shop-panel h3 {
  margin-top: 0;
  font-family: 'Bangers', cursive;
  color: var(--blue);
  font-size: 1.6rem;
  letter-spacing: 1px;
}

.shop-list {
  max-height: 560px;
  overflow-y: auto;
}

.upgrade-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  border-bottom: 2px dashed #d8c9a8;
}

.upgrade-row.locked {
  justify-content: center;
  color: #999;
  font-style: italic;
}

.upgrade-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border: 2px solid var(--ink);
  border-radius: 50%;
  background: var(--paper);
  flex-shrink: 0;
}

.upgrade-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  font-size: 0.95rem;
}

.upgrade-text span {
  color: #777;
  font-size: 0.8rem;
}

.bottom-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.leaderboard-panel {
  flex: 1;
  min-width: 280px;
  transform: rotate(-0.3deg);
}

.leaderboard-panel h3,
.admin-panel h3 {
  margin-top: 0;
  font-family: 'Bangers', cursive;
  color: var(--blue);
  letter-spacing: 1px;
}

.leaderboard-panel ol {
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: rank;
}

.leaderboard-panel li {
  counter-increment: rank;
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 0.95rem;
}

.leaderboard-panel li::before {
  content: counter(rank) '. ';
  color: var(--gold);
  font-weight: 700;
  margin-right: 4px;
}

.admin-panel {
  min-width: 220px;
  transform: rotate(0.6deg);
}

.btn {
  font-family: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  background: var(--gold);
  border: 2px solid var(--ink);
  border-radius: 6px;
  padding: 8px 16px;
  box-shadow: 3px 3px 0 var(--ink);
  transition: all 0.08s ease;
}

.btn:active:not(:disabled) {
  transform: translate(3px, 3px);
  box-shadow: none;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-ghost {
  background: var(--panel);
}

.btn-small {
  padding: 6px 12px;
  font-size: 0.8rem;
}
</style>