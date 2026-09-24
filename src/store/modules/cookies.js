const VILLAINS = [
  { name: 'Bouffon vert', image: '/src/assets/vilain3.png', baseHealth: 1000 },
  { name: 'Loki', image: '/src/assets/vilain7.webp', baseHealth: 5000 },
  { name: 'Ultron', image: '/src/assets/vilain4.png', baseHealth: 10000 },
  { name: 'Thanos', image: '/src/assets/vilain1.webp', baseHealth: 50000 },
  { name: 'Kang', image: '/src/assets/vilain5.png', baseHealth: 100000 },
  { name: 'Dr Doom', image: '/src/assets/vilain2.png', baseHealth: 1000000 }
];

const UPGRADE_DEFS = [
  { id: 'sentinel', name: 'Captain América', baseCost: 15, production: 0.1, image: '/src/assets/heros1.png' },
  { id: 'veteran', name: 'Black Panther', baseCost: 100, production: 1, image: '/src/assets/heros2.png' },
  { id: 'shield', name: 'Iron Man', baseCost: 500, multiplier: 2, maxOwned: 1, image: '/src/assets/heros3.png' },
  { id: 'base', name: 'Thor', baseCost: 1100, production: 8, image: '/src/assets/heros4.png' },
  { id: 'lab', name: 'Hulk', baseCost: 12000, production: 47, image: '/src/assets/heros5.png' },
  { id: 'hq', name: 'Scarlet Witch', baseCost: 130000, production: 260, image: '/src/assets/heros6.png' },
  { id: 'satellite', name: 'Doctor Strange', baseCost: 1400000, production: 1400, image: '/src/assets/heros7.png' },
  { id: 'ia', name: 'Captain Marvel', baseCost: 20000000, production: 7800, image: '/src/assets/heros8.png' }
];
 
function createUpgrades() {
  return UPGRADE_DEFS.map(def => ({ ...def, cost: def.baseCost, owned: 0 }));
}
 
function createInitialState() {
  return {
    cookies: 0,
    autoProduction: 0,
    clickMultiplier: 1,
    villainIndex: 0,
    villainsKilled: 0,
    currentHealth: VILLAINS[0].baseHealth,
    upgrades: createUpgrades(),
    lastRecruited: null 
  };
}
 
export default {
  namespaced: true,
  state: createInitialState(),
 
  getters: {
    currentVillain: state => VILLAINS[state.villainIndex],
    healthPercent: state => {
      const villain = VILLAINS[state.villainIndex];
      const maxHealth = Math.round(villain.baseHealth * (1 + state.villainsKilled * 0.4));
      return Math.max(0, Math.round((state.currentHealth / maxHealth) * 100));
    },
    canAfford: state => id => {
      const upgrade = state.upgrades.find(u => u.id === id);
      return upgrade && state.cookies >= upgrade.cost;
    },

    isUnlocked: state => id => {
      const index = state.upgrades.findIndex(u => u.id === id);
      if (index <= 0) return true;
      return state.upgrades[index - 1].owned > 0;
    },
    activeHeroes: state => state.upgrades.filter(u => u.owned > 0)
  },
 
  mutations: {
    HIT_VILLAIN(state, amount) {
      const dmg = amount * state.clickMultiplier;
      state.cookies += dmg;
      state.currentHealth -= dmg;
 
      if (state.currentHealth <= 0) {
        state.villainsKilled++;
        state.villainIndex = (state.villainIndex + 1) % VILLAINS.length;
        const nextVillain = VILLAINS[state.villainIndex];
        state.currentHealth = Math.round(nextVillain.baseHealth * (1 + state.villainsKilled * 0.4));
      }
    },
    BUY_UPGRADE(state, id) {
      const upgrade = state.upgrades.find(u => u.id === id);
      if (!upgrade || state.cookies < upgrade.cost) return;
      if (upgrade.maxOwned && upgrade.owned >= upgrade.maxOwned) return;
 
      state.cookies -= upgrade.cost;
      upgrade.owned++;
      if (upgrade.production) state.autoProduction += upgrade.production;
      if (upgrade.multiplier) state.clickMultiplier *= upgrade.multiplier;
 
      upgrade.cost = Math.round(upgrade.baseCost * Math.pow(1.15, upgrade.owned));
    },

    LOAD_SAVE(state, save) {
      const fresh = createInitialState();
 
      state.cookies = save.cookies ?? fresh.cookies;
      state.villainIndex = save.villainIndex ?? fresh.villainIndex;
      state.villainsKilled = save.villainsKilled ?? fresh.villainsKilled;
      state.currentHealth = save.currentHealth ?? fresh.currentHealth;
      state.autoProduction = 0;
      state.clickMultiplier = 1;
 
      state.upgrades = fresh.upgrades.map(def => {
        const savedProgress = (save.upgradesOwned || []).find(u => u.id === def.id);
        const owned = savedProgress ? savedProgress.owned : 0;
        const upgrade = { ...def, owned };
 
        if (owned > 0) {
          upgrade.cost = Math.round(def.baseCost * Math.pow(1.15, owned));
          if (def.production) state.autoProduction += def.production * owned;
          if (def.multiplier) state.clickMultiplier *= Math.pow(def.multiplier, owned);
        }
        return upgrade;
      });
    },
    RESET_STATE(state) {
      Object.assign(state, createInitialState());
    },
    SET_LAST_RECRUITED(state, hero) {
      state.lastRecruited = hero;
    },
    CLEAR_LAST_RECRUITED(state) {
      state.lastRecruited = null;
    }
  },
 
  actions: {
    click({ commit }) {
      commit('HIT_VILLAIN', 1);
    },
    buyUpgrade({ commit, getters, state }, id) {
      if (!getters.canAfford(id)) return;
      const upgrade = state.upgrades.find(u => u.id === id);
 
      commit('BUY_UPGRADE', id);
 
      commit('SET_LAST_RECRUITED', { name: upgrade.name, image: upgrade.image });
      setTimeout(() => commit('CLEAR_LAST_RECRUITED'), 1800);
    },
    startAutoProduction({ commit, state }) {
      setInterval(() => {
        if (state.autoProduction > 0) commit('HIT_VILLAIN', state.autoProduction);
      }, 1000);
    }
  }
};
