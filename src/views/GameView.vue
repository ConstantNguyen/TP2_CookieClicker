<template>
  <div class="board">
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
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'GameView',
  computed: {
    ...mapState('cookies', ['upgrades', 'lastRecruited']),
    ...mapGetters('cookies', ['currentVillain', 'healthPercent', 'canAfford', 'isUnlocked', 'activeHeroes'])
  },
  methods: {
    ...mapActions('cookies', ['click', 'buyUpgrade'])
  }
};
</script>