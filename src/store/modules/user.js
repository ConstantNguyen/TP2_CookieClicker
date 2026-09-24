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
    login({ commit, dispatch }, username) {
      const role = username.startsWith('admin_') ? 'admin' : 'player';
      commit('cookies/RESET_STATE', null, { root: true });
      commit('SET_USER', { username, role });
      dispatch('loadGame');
    },
    logout({ commit, dispatch }) {
      dispatch('saveGame');
      commit('LOGOUT');
    },

    saveGame({ state, rootState, dispatch }) {
      if (!state.username) return;

      const gameData = {
        cookies: rootState.cookies.cookies,
        villainIndex: rootState.cookies.villainIndex,
        villainsKilled: rootState.cookies.villainsKilled,
        currentHealth: rootState.cookies.currentHealth,
        upgradesOwned: rootState.cookies.upgrades.map(u => ({ id: u.id, owned: u.owned }))
      };
      localStorage.setItem(`save-${state.username}`, JSON.stringify(gameData));


      if (rootState.cookies.cookies > 0) {
        dispatch('leaderboard/updateScore', { username: state.username, cookies: rootState.cookies.cookies }, { root: true });
      }
    },
    loadGame({ state, commit }) {
      const saved = localStorage.getItem(`save-${state.username}`);
      if (saved) commit('cookies/LOAD_SAVE', JSON.parse(saved), { root: true });
    }
  }
};