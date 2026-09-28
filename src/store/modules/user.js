export default {
  namespaced: true,
  state: {
    username: null,
    role: 'player',
    isLoggedIn: false
  },

  getters: {
    isAdmin: state => state.role === 'admin'
  },

  mutations: {
    SET_USER(state, { username, role }) {
      state.username = username;
      state.role = role;
      state.isLoggedIn = true;
    },
    LOGOUT(state) {
      state.username = null;
      state.role = 'player';
      state.isLoggedIn = false;
    }
  },

  actions: {
    login(context, username) {
      const role = username === 'admin' ? 'admin' : 'player';
      context.commit('cookies/RESET_STATE', null, { root: true });
      context.commit('SET_USER', { username: username, role: role });
      context.dispatch('loadGame');
    },
    logout(context) {
      context.dispatch('saveGame');
      context.commit('LOGOUT');
    },

    saveGame(context) {
      const username = context.state.username;
      if (!username) return;

      const gameData = {
        cookies: context.rootState.cookies.cookies,
        villainIndex: context.rootState.cookies.villainIndex,
        villainsKilled: context.rootState.cookies.villainsKilled,
        currentHealth: context.rootState.cookies.currentHealth,
        upgradesOwned: [],
      };

      for (const upgrade of context.rootState.cookies.upgrades) {
        const savedUpgrade = {
          id: upgrade.id,
          owned: upgrade.owned,
        };
        gameData.upgradesOwned.push(savedUpgrade);
      }

      const savedGame = JSON.stringify(gameData);
      localStorage.setItem(`save-${username}`, savedGame);

      const currentCookies = context.rootState.cookies.cookies;
      if (currentCookies > 0) {
        const scoreUpdate = {
          username: username,
          cookies: currentCookies,
        };
        context.dispatch('leaderboard/updateScore', scoreUpdate, { root: true });
      }
    },
    loadGame(context) {
      const username = context.state.username;
      const savedGame = localStorage.getItem(`save-${username}`);

      if (savedGame) {
        const gameData = JSON.parse(savedGame);
        context.commit('cookies/LOAD_SAVE', gameData, { root: true });
      }
    }
  }
};