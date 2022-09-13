<template>
  <header>
    <div class="home-menu pure-menu pure-menu-horizontal">
      <a class="pure-menu-heading">FFXIV Log Parser</a>

      <nav class="pure-menu-list">
        <RouterLink class="pure-menu-item" to="/">Home</RouterLink>
        <RouterLink class="pure-menu-item" to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <div class="container">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.home-menu {
  background: #2d3e50;
  padding: 0.5em;
  box-shadow: 0 1px 1px rgba(0,0,0, 0.10);
}
.home-menu .pure-menu-heading {
  color: white;
  font-weight: 400;
  font-size: 120%;
}
.home-menu .pure-menu-item + .pure-menu-item {
  margin-left: 1em;
}
.home-menu a {
  color: white;
}

.container {
  margin: auto;
  padding: 1em 0;
  max-width: 1440px;
}
</style>
