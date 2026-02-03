<script setup lang="ts">
import { computed } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import type { ColDef, ModelUpdatedEvent } from "ag-grid-enterprise";
import { TreeStore, type TreeStoreItem } from "../models/TreeStore";

const items: TreeStoreItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' }
];
const treeStore = new TreeStore(items);
const rowData = computed(() => treeStore.getAll());

const getDataPath = (data: TreeStoreItem): string[] => {
  const parents = treeStore.getAllParents(data.id);
  return parents.reverse().map(item => String(item.id));
};

const colDefs: ColDef[] = [
  {
    headerName: '№ п/п',
    colId: 'rowNumber',
    valueGetter: (params: any) => {
      return params.node?.rowIndex + 1
    },
    width: 110,
    sortable: false,
    filter: false,
    pinned: 'left'
  },
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
  },
]

const onModelUpdated = (params: ModelUpdatedEvent) => {
  params.api?.resetRowHeights();
  params.api?.refreshCells({
    columns: ['rowNumber'],
    force: true,
  });
};
</script>

<template>
  <AgGridVue
      :rowData="rowData"
      :columnDefs="colDefs"
      :getDataPath="getDataPath"
      :treeData="true"
      :autoGroupColumnDef="{
        headerName: 'Категория',
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: (params: any) => {
            const hasChildren = treeStore.getChildren(params.data.id).length > 0;
            return hasChildren ? 'Группа' : 'Элемент';
          }
        },
         width: 300,
      }"
      @model-updated="onModelUpdated"
      class="agGridVue"
  />
</template>

<style scoped>
.agGridVue {
  height: 100vh;
}
</style>
