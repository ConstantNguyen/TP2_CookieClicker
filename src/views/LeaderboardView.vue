<template>
  <div class="bottom-row">
    <section class="panel leaderboard-panel">
      <h3>Classement</h3>
      <ol>
        <li v-for="entry in sortedLeaderboard" :key="entry.username">
          <span>{{ entry.username }}</span><span>{{ Math.round(entry.cookies) }}</span>
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
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'LeaderboardView',
  computed: {
    ...mapGetters('user', ['isAdmin']),
    ...mapGetters('leaderboard', ['sortedLeaderboard'])
  },
  methods: {
    ...mapActions('leaderboard', ['adminResetGame'])
  }
};
</script>