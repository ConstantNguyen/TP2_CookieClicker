<template>
  <div class="board">
    <section v-if="activeChallenge" class="challenge-banner panel" :class="{ 'challenge-won': challengeWon }">
      <div class="challenge-content">
        <span class="challenge-label">MISSION SPÉCIALE</span>
        <h2>Défi contre {{ activeChallenge.opponent }}</h2>
        <p>
          Rival : {{ Math.floor(activeChallenge.opponentScore) }} cookies · Objectif :
          {{ activeChallenge.requiredCookies }} cookies gagnés pendant le défi
        </p>
        <div
          class="challenge-progress"
          role="progressbar"
          :aria-valuenow="Math.floor(challengeProgress)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Progression du défi contre ${activeChallenge.opponent}`"
        >
          <div class="challenge-progress-fill" :style="{ width: challengeProgress + '%' }"></div>
        </div>
        <strong v-if="challengeWon">Défi relevé !</strong>
        <span v-else>
          {{ Math.floor(activeChallenge.earnedCookies) }} / {{ activeChallenge.requiredCookies }} cookies gagnés
        </span>
      </div>
      <button class="btn btn-ghost" type="button" @click="clearChallenge">
        {{ challengeWon ? 'Fermer' : 'Abandonner' }}
      </button>
    </section>

    <section class="click-panel panel">
      <h2 class="villain-name">{{ currentVillain.name }}</h2>
      <div class="health-bar">
        <div class="health-fill" :style="{ width: healthPercent + '%' }"></div>
      </div>

      <button class="villain-click" @click="click">
        <img :src="currentVillain.image" alt="Vilain" />
      </button>

      <div class="team-row" v-if="activeHeroes.length">
        <img v-for="hero in activeHeroes" :key="hero.id" :src="hero.image" :alt="hero.name" class="team-icon" />
      </div>

      <transition name="arrive">
        <div v-if="lastRecruited" class="arrival">
          <img :src="lastRecruited.image" alt="" />
          <span>{{ lastRecruited.name }} vient t'aider !</span>
        </div>
      </transition>
    </section>

    <aside class="shop-panel panel">
      <h3>Renforts</h3>
      <div class="shop-list">
        <div
          v-for="upgrade in upgrades"
          :key="upgrade.id"
          class="upgrade-row"
          :class="{ locked: !isUnlocked(upgrade.id) }"
        >
          <template v-if="isUnlocked(upgrade.id)">
            <img :src="upgrade.image" class="upgrade-icon" :alt="upgrade.name" />
            <div class="upgrade-text">
              <strong>{{ upgrade.name }}</strong>
              <span>x{{ upgrade.owned }} · {{ Math.round(upgrade.cost) }} cookies</span>
            </div>
            <button class="btn btn-small" :disabled="!canAfford(upgrade.id)" @click="buyUpgrade(upgrade.id)">
              Recruter
            </button>
          </template>
          <template v-else>
            <span class="locked-label">🔒 ???</span>
          </template>
        </div>
      </div>
    </aside>
  </div>
</template>

<script>
export default {
  name: 'GameView',
  computed: {
    cookies() {
      return this.$store.state.cookies.cookies;
    },
    upgrades() {
      return this.$store.state.cookies.upgrades;
    },
    lastRecruited() {
      return this.$store.state.cookies.lastRecruited;
    },
    activeChallenge() {
      return this.$store.state.leaderboard.activeChallenge;
    },
    currentVillain() {
      return this.$store.getters['cookies/currentVillain'];
    },
    healthPercent() {
      return this.$store.getters['cookies/healthPercent'];
    },
    canAfford() {
      return this.$store.getters['cookies/canAfford'];
    },
    isUnlocked() {
      return this.$store.getters['cookies/isUnlocked'];
    },
    activeHeroes() {
      return this.$store.getters['cookies/activeHeroes'];
    },
    challengeWon() {
      if (this.activeChallenge === null) {
        return false;
      }

      return this.activeChallenge.earnedCookies >= this.activeChallenge.requiredCookies;
    },
    challengeProgress() {
      if (this.activeChallenge === null) {
        return 0;
      }

      const progress =
        (this.activeChallenge.earnedCookies / this.activeChallenge.requiredCookies) * 100;

      if (progress > 100) {
        return 100;
      }

      return progress;
    }
  },
  methods: {
    click() {
      this.$store.dispatch('cookies/click');
    },
    buyUpgrade(id) {
      this.$store.dispatch('cookies/buyUpgrade', id);
    },
    clearChallenge() {
      this.$store.dispatch('leaderboard/clearChallenge');
    }
  }
};
</script>

<style scoped>
.challenge-banner {
  display: flex;
  flex: 0 0 100%;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-color: var(--red);
  box-shadow: 6px 6px 0 var(--red);
  transform: rotate(0.2deg);
}

.challenge-content {
  flex: 1;
  min-width: 0;
}

.challenge-label {
  color: var(--red);
  font-size: 0.75rem;
  font-weight: 700;
}

.challenge-content h2 {
  margin: 3px 0;
  font-family: 'Bangers', cursive;
  color: var(--blue);
}

.challenge-content p {
  margin: 4px 0 8px;
}

.challenge-progress {
  width: 100%;
  max-width: 420px;
  height: 14px;
  margin-bottom: 6px;
  overflow: hidden;
  border: 2px solid var(--ink);
  background: var(--panel);
}

.challenge-progress-fill {
  height: 100%;
  background: var(--gold);
  transition: width 0.2s ease;
}

.challenge-won .challenge-progress-fill {
  background: #55a84f;
}

@media (max-width: 640px) {
  .challenge-banner {
    align-items: stretch;
    flex-direction: column;
  }

  .challenge-banner > button {
    align-self: flex-start;
  }
}
</style>