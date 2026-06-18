<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Chart from './components/Chart.vue';

interface EnergyAverage {
  fuel: string;
  average: number;
}

interface EnergeticMixDay {
  date: string;
  cleanEnergyPercentage: number;
  energyAverages: EnergyAverage[];
}

interface OptimalChargingWindow {
  startTime: string;
  endTime: string;
  averageCleanEnergy: number;
}

const legend = [
  { fuel: 'bio masa', color: '#42b883' },
  { fuel: 'węgiel', color: '#35495e' },
  { fuel: 'import', color: '#f1c40f' },
  { fuel: 'gaz', color: '#e74c3c' },
  { fuel: 'atom', color: '#3498db' },
  { fuel: 'inne', color: '#9b59b6' },
  { fuel: 'woda', color: '#1abc9c' },
  { fuel: 'słońce', color: '#e67e22' },
  { fuel: 'wiatr', color: '#95a5a6' }
];

const days = ref<EnergeticMixDay[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const pickedHours = ref<number>(4);
const optimalWindow = ref<OptimalChargingWindow | null>(null);
const WindowLoading = ref<boolean>(false);

async function getMix() {
  try {
    loading.value = true;
    error.value = null;
    const response = await fetch('https://localhost:7189/api/energy/miks');
    if (!response.ok) throw new Error(`Błąd miksu: ${response.status}`);
    days.value = await response.json();
  } catch (error: any) {
    error.value = error.message;
    console.error(error);
  } finally {
    loading.value = false;
  }
}

async function getOptimalWindow() {
  try {
    WindowLoading.value = true;
    const response = await fetch(`https://localhost:7189/api/energy/CleanWindow/${pickedHours.value}`);
    if (!response.ok) throw new Error(`Błąd optymalizacji: ${response.status}`);
    optimalWindow.value = await response.json();
  } catch (error) {
    console.error("Nie udało się pobrać optymalnego okna:", error);
  } finally {
    WindowLoading.value = false;
  }
}

watch(pickedHours, () => {
  getOptimalWindow();
});

function formatData(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
  getMix();
  getOptimalWindow();
});
</script>

<template>
  <div class="container-fluid bg-light text-dark min-vh-100 p-4 app-kontener">

    <header class="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-light-subtle">
      <h1 class="h2 mb-0 tytul-glowny fw-bold">Brytyjski mix energetyczny</h1>
      <button class="btn btn-akcent text-white px-4 py-2" @click="getMix" :disabled="loading">
        {{ loading ? 'Odświeżanie...' : 'Odśwież dane' }}
      </button>
    </header>

    <div class="row g-4 layout-row">

      <aside class="col-12 col-lg-7 kolumna-analityki">
        <h2 class="tytul-sekcji mb-3 fw-semibold">Porównanie Prognoz Dziennych</h2>

        <div v-if="loading" class="alert alert-info text-center shadow-sm" role="alert">
          Pobieranie danych z Carbon Intensity API...
        </div>

        <div v-else-if="error" class="alert alert-danger text-center shadow-sm" role="alert">
          <strong>Błąd:</strong> {{ error }}
        </div>

        <div v-else class="card border-0 shadow-sm p-4 bg-white rounded-3">

          <div class="row g-3 pb-4 border-bottom kontener-wykresow-row">
            <div v-for="dzien in days" :key="dzien.date" class="col-12 col-md-4">
              <div class="card h-100 p-3 text-center align-items-center justify-content-between mini-karta-wykresu border border-light-subtle bg-light">
                <div class="mb-4">
                  <span class="d-block fw-bold mb-2 data-naglowek text-secondary">{{ formatData(dzien.date).split(' 2026')[0] }}</span>
                  <span class="badge eko-badge px-2 py-1.5">{{ dzien.cleanEnergyPercentage }}% eko</span>
                </div>

                <div class="w-100 chart-container-box pt-2">
                  <Chart :fuel-data="dzien.energyAverages" :pokaz-legende="false" />
                </div>
              </div>
            </div>
          </div>

          <div class="wspolna-legenda-sekcja pt-4">
            <h4 class="mb-3 text-secondary text-uppercase tracking-wider small fw-bold">Legenda źródeł zasilania sieci:</h4>
            <div class="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-3 legenda-grid">
              <div v-for="pozycja in legend" :key="pozycja.fuel" class="col d-flex align-items-center gap-2 legenda-item">
                <span class="kolor-box shadow-sm" :style="{ backgroundColor: pozycja.color }"></span>
                <span class="nazwa-paliwa-legenda text-capitalize text-dark-emphasis">{{ pozycja.fuel }}</span>
              </div>
            </div>
          </div>

        </div>
      </aside>

      <main class="col-12 col-lg-5 kolumna-glowna sticky-lg-top" style="top: 20px; height: fit-content;">
        <section class="card border-0 shadow-sm p-4 bg-white rounded-3 sekcja-optymalizacji">
          <h2 class="h4 mb-1 fw-bold text-dark">Optymalne Okno Ładowania Samochodu</h2>
          <p class="text-muted opis mb-4">Ustaw wymagany czas ładowania baterii:</p>

          <div class="d-flex align-items-center gap-3 mb-4 suwak-kontener">
            <input type="range"
                   min="1"
                   max="12"
                   v-model.number="pickedHours"
                   class="form-range suwak" />
            <span class="badge btn-akcent fs-6 px-3 py-2 godziny-badge text-white text-nowrap shadow-sm">{{ pickedHours }} godz.</span>
          </div>

          <div v-if="WindowLoading" class="text-center text-muted fst-italic py-3 mini-loading">
            <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
            Przeliczanie parametrów sieci...
          </div>

          <div v-else-if="optimalWindow" class="card p-4 wynik-karta border border-light-subtle bg-light">
            <div class="d-flex justify-content-around align-items-center text-center mb-4 wynik-glowny">

              <div class="czas-box">
                <span class="text-muted small fw-bold etykieta d-block mb-1">START ŁADOWANIA</span>
                <span class="d-block fw-bold display-6 godzina text-dark">{{ formatTime(optimalWindow.startTime) }}</span>
                <span class="text-secondary small data fw-medium">{{ formatData(optimalWindow.startTime).split(' 2026')[0] }}</span>
              </div>


              <div class="czas-box">
                <span class="text-muted small fw-bold etykieta d-block mb-1">KONIEC ŁADOWANIA</span>
                <span class="d-block fw-bold display-6 godzina text-dark">{{ formatTime(optimalWindow.endTime) }}</span>
                <span class="text-secondary small data fw-medium">{{ formatData(optimalWindow.endTime).split(' 2026')[0] }}</span>
              </div>
            </div>

            <div class="procent-sekcja pt-3 border-top border-light-subtle text-center">
              <p class="text-muted mb-2 small fw-medium">Średni udział czystej energii w tym przedziale:</p>
              <div class="display-4 fw-bold procent-wielki mb-3">{{ optimalWindow.averageCleanEnergy }}%</div>

              <div class="progress pasek-tlo bg-body-secondary" style="height: 10px;">
                <div class="progress-bar pasek-progres"
                     role="progressbar"
                     :style="{ width: optimalWindow.averageCleanEnergy + '%' }"
                     :aria-valuenow="optimalWindow.averageCleanEnergy"
                     aria-valuemin="0"
                     aria-valuemax="100">
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

    </div>
  </div>
</template>

<style scoped src="./assets/app-styles.css"></style>
