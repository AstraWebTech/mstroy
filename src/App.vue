<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';

interface Mission {
  mission: string;
  company: string;
  location: string;
  date: string;
  price: number;
  successful: boolean;
  rocket: string;
}

const rowData = ref<Mission[]>([]);
const colDefs = ref([
  { field: 'mission' },
  { field: 'company',},
  { field: 'location' },
  {
    field: 'date',
    valueFormatter: (params: any) => {
      const date = new Date(params.value);
      return isNaN(date.getTime()) ? params.value : date.toLocaleDateString();
    },
  },
  {
    field: 'price',
    valueFormatter: (params: any) => {
      return '£' + params.value.toLocaleString();
    }
  },
  { field: 'successful' },
  { field: 'rocket' }
]);

const defaultColDef = ref({
  filter: true,
  editable: true,
  sortable: true,
  resizable: true
});

const onCellValueChanged = (event: any) => {
  console.log('event.value:', event.value);
};

const fetchData = async (): Promise<Mission[]> => {
  const response = await fetch('https://www.ag-grid.com/example-assets/space-mission-data.json');
  return response.json();
};

onMounted(async () => {
  rowData.value = await fetchData();
});
</script>

<template>
  <div style="width: 100%; height: 600px">
    <AgGridVue
        style="width: 100%; height: 100%"
        :columnDefs="colDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        :pagination="true"
        @cell-value-changed="onCellValueChanged"
        class="agGridVue"
    />
  </div>
</template>

<style scoped>
.agGridVue {
  height: 100vh;
}
</style>
