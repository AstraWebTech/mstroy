import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllEnterpriseModule]);

createApp(App).mount('#app')
