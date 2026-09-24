export default {
  namespaced: true,
  state: {
    scores: {},
  },

  getters: {
    sortedLeaderboard: (state) =>
      Object.entries(state.scores)
        .map(([username, cookies]) => ({ username, cookies }))
        .sort((a, b) => b.cookies - a.cookies),
  },

  mutations: {
    UPDATE_SCORE(state, { username, cookies }) {
      state.scores[username] = cookies;
    },
    RESET_ALL(state) {
      state.scores = {};
    },
    LOAD_SCORES(state, scores) {
      state.scores = scores;
    },
  },

  actions: {
    updateScore({ commit, state }, payload) {
      commit("UPDATE_SCORE", payload);
      localStorage.setItem("leaderboard", JSON.stringify(state.scores));
    },
    loadScores({ commit }) {
      const saved = localStorage.getItem("leaderboard");
      if (saved) commit("LOAD_SCORES", JSON.parse(saved));
    },

    adminResetGame({ commit, state, rootGetters }) {
      if (!rootGetters["user/isAdmin"]) return;

      const usernames = Object.keys(state.scores);
      commit("RESET_ALL");
      localStorage.removeItem("leaderboard");
      usernames.forEach((username) =>
        localStorage.removeItem(`save-${username}`),
      );

      commit("cookies/RESET_STATE", null, { root: true });
    },
    adminSetScore({ commit, rootGetters }, payload) {
      if (!rootGetters["user/isAdmin"]) return;
      commit("UPDATE_SCORE", payload);
    },
  },
};
