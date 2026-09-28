<template>
  <div class="bottom-row">
    <section class="panel leaderboard-panel">
      <h3>Classement</h3>
      <ol>
        <li v-for="entry in sortedLeaderboard" :key="entry.username" class="leaderboard-entry">
          <span class="player-name">{{ entry.username }}</span>
          <span class="player-score">{{ Math.round(entry.cookies) }}</span>
          <button
            v-if="username !== entry.username"
            class="btn btn-small challenge-button"
            type="button"
            @click="startChallenge(entry.username)"
          >
            Défier
          </button>
          <form v-if="isAdmin" class="score-editor" @submit.prevent="applyScore(entry.username)">
            <input
              type="number"
              min="0"
              step="any"
              required
              :value="scoreEdits[entry.username] ?? entry.cookies"
              :aria-label="`Score de ${entry.username}`"
              @input="setScoreDraft(entry.username, $event.target.value)"
            />
            <button class="btn btn-small" type="submit">Modifier</button>
          </form>
        </li>
      </ol>
    </section>

    <section v-if="isAdmin" class="panel admin-panel">
      <h3>Admin</h3>
      <button class="btn btn-ghost" @click="adminResetGame">Réinitialiser le classement</button>
    </section>
  </div>
</template>

<script>
export default {
  name: 'LeaderboardView',
  data() {
    return { scoreEdits: {} };
  },
  computed: {
    username() {
      return this.$store.state.user.username;
    },
    isAdmin() {
      return this.$store.getters['user/isAdmin'];
    },
    sortedLeaderboard() {
      return this.$store.getters['leaderboard/sortedLeaderboard'];
    }
  },
  methods: {
    adminResetGame() {
      this.$store.dispatch('leaderboard/adminResetGame');
    },
    adminSetScore(scoreUpdate) {
      this.$store.dispatch('leaderboard/adminSetScore', scoreUpdate);
    },
    challengePlayer(opponent) {
      this.$store.dispatch('leaderboard/challengePlayer', opponent);
    },
    startChallenge(opponent) {
      this.challengePlayer(opponent);
      this.$router.push('/');
    },
    setScoreDraft(username, value) {
      this.scoreEdits[username] = value;
    },
    applyScore(username) {
      const value = this.scoreEdits[username];
      if (value === undefined || value.trim() === '') return;

      const cookies = Number(value);
      if (!Number.isFinite(cookies) || cookies < 0) return;

      this.adminSetScore({ username, cookies });
      delete this.scoreEdits[username];
    }
  }
};
</script>

<style scoped>
.leaderboard-entry {
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.player-name {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.player-score {
  font-variant-numeric: tabular-nums;
}

.challenge-button {
  padding: 6px 10px;
}

.score-editor {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-editor input {
  width: 110px;
  min-width: 0;
  padding: 6px 8px;
  border: 2px solid var(--ink);
  border-radius: 4px;
  font: inherit;
}

.score-editor .btn {
  padding: 6px 10px;
}

@media (max-width: 520px) {
  .score-editor {
    width: 100%;
  }

  .score-editor input {
    flex: 1;
  }

  .challenge-button {
    margin-left: auto;
  }
}
</style>