<template>
  <header class="app-header">
    <h1>&#x1F4AA; Fitness Tracker</h1>
    <NavBar />
  </header>
  <main>
    <!-- The component for the current route will be rendered here -->
    <router-view />
  </main>
</template>

<script setup>
// Import the navigation component to be used in the main layout
import NavBar from './components/NavBar.vue';
</script>