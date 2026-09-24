import { createStore } from 'vuex';
import cookies from './modules/cookies.js';
import user from './modules/user.js';
import leaderboard from './modules/leaderboard.js';

export default createStore({
  modules: { cookies, user, leaderboard }
});