export default {
  namespaced: true,
  state: {
    scores: {},
    activeChallenge: null,
  },

  getters: {
    sortedLeaderboard(state) {
      const leaderboard = [];
      const usernames = Object.keys(state.scores);

      for (const username of usernames) {
        const playerScore = {
          username: username,
          cookies: state.scores[username],
        };
        leaderboard.push(playerScore);
      }

      leaderboard.sort(function (firstPlayer, secondPlayer) {
        return secondPlayer.cookies - firstPlayer.cookies;
      });

      return leaderboard;
    },
  },

  mutations: {
    UPDATE_SCORE(state, scoreUpdate) {
      state.scores[scoreUpdate.username] = scoreUpdate.cookies;
    },
    RESET_ALL(state) {
      state.scores = {};
      state.activeChallenge = null;
    },
    LOAD_SCORES(state, scores) {
      state.scores = scores;
    },
    START_CHALLENGE(state, challenge) {
      state.activeChallenge = challenge;
    },
    CLEAR_CHALLENGE(state) {
      state.activeChallenge = null;
    },
    ADD_CHALLENGE_COOKIES(state, cookiesGained) {
      if (!state.activeChallenge) return;

      const newEarnedCookies = state.activeChallenge.earnedCookies + cookiesGained;

      if (newEarnedCookies >= state.activeChallenge.requiredCookies) {
        state.activeChallenge.earnedCookies = state.activeChallenge.requiredCookies;
      } else {
        state.activeChallenge.earnedCookies = newEarnedCookies;
      }
    },
  },

  actions: {
    updateScore(context, scoreUpdate) {
      context.commit("UPDATE_SCORE", scoreUpdate);
      const savedScores = JSON.stringify(context.state.scores);
      localStorage.setItem("leaderboard", savedScores);
    },
    loadScores(context) {
      const saved = localStorage.getItem("leaderboard");

      if (saved) {
        const scores = JSON.parse(saved);
        context.commit("LOAD_SCORES", scores);
      }
    },

    adminResetGame(context) {
      const isAdmin = context.rootGetters["user/isAdmin"];
      if (!isAdmin) return;

      const usernames = Object.keys(context.state.scores);
      context.commit("RESET_ALL");
      localStorage.removeItem("leaderboard");

      for (const username of usernames) {
        localStorage.removeItem(`save-${username}`);
      }

      context.commit("cookies/RESET_STATE", null, { root: true });
    },
    adminSetScore(context, scoreUpdate) {
      const isAdmin = context.rootGetters["user/isAdmin"];
      if (!isAdmin) return;

      context.commit("UPDATE_SCORE", scoreUpdate);
      const savedScores = JSON.stringify(context.state.scores);
      localStorage.setItem("leaderboard", savedScores);

      const saveKey = `save-${scoreUpdate.username}`;
      const savedGame = localStorage.getItem(saveKey);
      let gameData = {};

      if (savedGame) {
        try {
          gameData = JSON.parse(savedGame);
        } catch {
          gameData = {};
        }
      }

      gameData.cookies = scoreUpdate.cookies;
      const savedPlayerGame = JSON.stringify(gameData);
      localStorage.setItem(saveKey, savedPlayerGame);

      const editedPlayerIsLoggedIn = context.rootState.user.username === scoreUpdate.username;
      if (editedPlayerIsLoggedIn) {
        context.commit("cookies/SET_COOKIES", scoreUpdate.cookies, { root: true });
      }
    },
    challengePlayer(context, opponent) {
      const challenger = context.rootState.user.username;
      const opponentScore = context.state.scores[opponent];
      if (!challenger || challenger === opponent || !Number.isFinite(opponentScore)) return;

      let requiredCookies = Math.ceil(opponentScore * 0.2);
      if (requiredCookies < 100) {
        requiredCookies = 100;
      }

      const challenge = {
        opponent,
        opponentScore,
        requiredCookies,
        earnedCookies: 0,
      };
      context.commit("START_CHALLENGE", challenge);
    },
    clearChallenge(context) {
      context.commit("CLEAR_CHALLENGE");
    },
  },
};
