<script setup lang="ts">
import { Pie } from 'vue-chartjs';
import { Chart, Title, Tooltip, Legend, ArcElement, CategoryScale, type ChartData, type ChartOptions } from 'chart.js';
import { computed } from 'vue';

Chart.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

interface EnergyAverage {
  fuel: string;
  average: number;
}

const props = defineProps<{
  fuelData: EnergyAverage[]
}>();

const translation: Record<string, string> = {
  'biomass': 'bio masa',
  'coal': 'węgiel',
  'imports': 'import',
  'gas': 'gaz',
  'nuclear': 'atom',
  'other': 'inne',
  'hydro': 'woda',
  'solar': 'słońce',
  'wind': 'wiatr'
};

function translate(english: string): string {
  const name = english.toLowerCase();
  return translation[name];
}

const chartData = computed<ChartData<'pie'>>(() => {
  return {
    labels: props.fuelData.map(item => translate(item.fuel)),
    datasets: [
      {
        label: 'Udział procentowy',
        data: props.fuelData.map(item => item.average),
        backgroundColor: [
          '#42b883', '#35495e', '#f1c40f', '#e74c3c', '#3498db',
          '#9b59b6', '#1abc9c', '#e67e22', '#95a5a6'
        ],
        borderWidth: 1,
        borderColor: '#1e1e1e'
      }
    ]
  };
});

const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return ` ${context.label}: ${context.raw}%`;
        }
      }
    }
  }
};
</script>

<template>
  <div class="chart-container">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
  .chart-container {
    position: relative;
    width: 100%;
    max-width: 250px; 
    height: auto;
    margin: 0 auto;
  }
</style>
