<script setup>
import LoginPage from './views/LoginPage.vue';
import DashboardLayouts from './layouts/DashboardLayouts.vue';
import ToastNotification from './components/ToastNotification.vue';
import { ref } from 'vue';

const isLoggedIn = ref(false);

function handleLoginSuccess() {
  console.log('Emitting loginSuccess event'); // Debugging log
  isLoggedIn.value = true;
}
</script>

<template>
  <div id="app">
    <LoginPage v-if="!isLoggedIn" @loginSuccess="handleLoginSuccess" />
    <DashboardLayouts v-else @logout="isLoggedIn = false" />
    <ToastNotification />
  </div>
</template>

<style scoped>
</style>
