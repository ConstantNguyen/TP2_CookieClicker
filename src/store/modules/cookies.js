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
 
function createUpgrade(definition) {
  const upgrade = {
    id: definition.id,
    name: definition.name,
    baseCost: definition.baseCost,
    image: definition.image,
    cost: definition.baseCost,
    owned: 0,
  };

  if (definition.production !== undefined) {
    upgrade.production = definition.production;
  }
  if (definition.multiplier !== undefined) {
    upgrade.multiplier = definition.multiplier;
  }
  if (definition.maxOwned !== undefined) {
    upgrade.maxOwned = definition.maxOwned;
  }

  return upgrade;
}

function createUpgrades() {
  const upgrades = [];

  for (const definition of UPGRADE_DEFS) {
    upgrades.push(createUpgrade(definition));
  }

  return upgrades;
}

function findUpgrade(upgrades, id) {
  for (const upgrade of upgrades) {
    if (upgrade.id === id) {
      return upgrade;
    }
  }

  return null;
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
    doubleCookies(state) {
      return state.cookies * 2;
    },
    currentVillain(state) {
      return VILLAINS[state.villainIndex];
    },
    healthPercent(state) {
      const villain = VILLAINS[state.villainIndex];
      const healthMultiplier = 1 + state.villainsKilled * 0.4;
      const maximumHealth = Math.round(villain.baseHealth * healthMultiplier);
      const healthRatio = state.currentHealth / maximumHealth;
      const percentage = Math.round(healthRatio * 100);

      return Math.max(0, percentage);
    },
    canAfford(state) {
      return function (id) {
        const upgrade = findUpgrade(state.upgrades, id);

        if (upgrade === null) {
          return false;
        }

        return state.cookies >= upgrade.cost;
      };
    },
    isUnlocked(state) {
      return function (id) {
        let upgradeIndex = -1;

        for (let index = 0; index < state.upgrades.length; index++) {
          if (state.upgrades[index].id === id) {
            upgradeIndex = index;
            break;
          }
        }

        if (upgradeIndex <= 0) {
          return true;
        }

        const previousUpgrade = state.upgrades[upgradeIndex - 1];
        return previousUpgrade.owned > 0;
      };
    },
    activeHeroes(state) {
      const heroes = [];

      for (const upgrade of state.upgrades) {
        if (upgrade.owned > 0) {
          heroes.push(upgrade);
        }
      }

      return heroes;
    },
  },
 
  mutations: {
    ajouterCookie(state, amount) {
      const cookiesGained = amount * state.clickMultiplier;
      state.cookies += cookiesGained;
      state.currentHealth -= cookiesGained;

      if (state.currentHealth <= 0) {
        state.villainsKilled += 1;
        state.villainIndex += 1;

        if (state.villainIndex >= VILLAINS.length) {
          state.villainIndex = 0;
        }

        const nextVillain = VILLAINS[state.villainIndex];
        const healthMultiplier = 1 + state.villainsKilled * 0.4;
        state.currentHealth = Math.round(nextVillain.baseHealth * healthMultiplier);
      }
    },
    BUY_UPGRADE(state, id) {
      const upgrade = findUpgrade(state.upgrades, id);

      if (upgrade === null) {
        return;
      }
      if (state.cookies < upgrade.cost) {
        return;
      }
      if (upgrade.maxOwned && upgrade.owned >= upgrade.maxOwned) {
        return;
      }

      state.cookies -= upgrade.cost;
      upgrade.owned += 1;

      if (upgrade.production) {
        state.autoProduction += upgrade.production;
      }
      if (upgrade.multiplier) {
        state.clickMultiplier *= upgrade.multiplier;
      }

      upgrade.cost = Math.round(upgrade.baseCost * Math.pow(1.15, upgrade.owned));
    },

    LOAD_SAVE(state, save) {
      const fresh = createInitialState();
 
      state.cookies = fresh.cookies;
      state.villainIndex = fresh.villainIndex;
      state.villainsKilled = fresh.villainsKilled;
      state.currentHealth = fresh.currentHealth;

      if (save.cookies !== null && save.cookies !== undefined) {
        state.cookies = save.cookies;
      }
      if (save.villainIndex !== null && save.villainIndex !== undefined) {
        state.villainIndex = save.villainIndex;
      }
      if (save.villainsKilled !== null && save.villainsKilled !== undefined) {
        state.villainsKilled = save.villainsKilled;
      }
      if (save.currentHealth !== null && save.currentHealth !== undefined) {
        state.currentHealth = save.currentHealth;
      }

      state.autoProduction = 0;
      state.clickMultiplier = 1;

      const savedUpgrades = save.upgradesOwned || [];
      const loadedUpgrades = [];

      for (const definition of UPGRADE_DEFS) {
        const upgrade = createUpgrade(definition);
        let owned = 0;

        for (const savedUpgrade of savedUpgrades) {
          if (savedUpgrade.id === definition.id) {
            owned = savedUpgrade.owned;
            break;
          }
        }

        upgrade.owned = owned;

        if (owned > 0) {
          upgrade.cost = Math.round(definition.baseCost * Math.pow(1.15, owned));

          if (definition.production) {
            state.autoProduction += definition.production * owned;
          }
          if (definition.multiplier) {
            state.clickMultiplier *= Math.pow(definition.multiplier, owned);
          }
        }

        loadedUpgrades.push(upgrade);
      }

      state.upgrades = loadedUpgrades;
    },
    RESET_STATE(state) {
      Object.assign(state, createInitialState());
    },
    SET_COOKIES(state, cookies) {
      state.cookies = cookies;
    },
    SET_LAST_RECRUITED(state, hero) {
      state.lastRecruited = hero;
    },
    CLEAR_LAST_RECRUITED(state) {
      state.lastRecruited = null;
    }
  },
 
  actions: {
    click(context) {
      context.commit('ajouterCookie', 1);

      const activeChallenge = context.rootState.leaderboard.activeChallenge;
      if (activeChallenge !== null) {
        context.commit(
          'leaderboard/ADD_CHALLENGE_COOKIES',
          context.state.clickMultiplier,
          { root: true },
        );
      }
    },
    buyUpgrade(context, id) {
      const canAffordUpgrade = context.getters.canAfford(id);
      if (!canAffordUpgrade) {
        return;
      }

      const upgrade = findUpgrade(context.state.upgrades, id);
      context.commit('BUY_UPGRADE', id);

      const recruitedHero = {
        name: upgrade.name,
        image: upgrade.image,
      };
      context.commit('SET_LAST_RECRUITED', recruitedHero);

      setTimeout(function () {
        context.commit('CLEAR_LAST_RECRUITED');
      }, 1800);
    },
    startAutoProduction(context) {
      setInterval(function () {
        const production = context.state.autoProduction;

        if (production > 0) {
          context.commit('ajouterCookie', production);

          const activeChallenge = context.rootState.leaderboard.activeChallenge;
          if (activeChallenge !== null) {
            const cookiesGained = production * context.state.clickMultiplier;
            context.commit(
              'leaderboard/ADD_CHALLENGE_COOKIES',
              cookiesGained,
              { root: true },
            );
          }
        }
      }, 1000);
    }
  }
};
