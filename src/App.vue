<template>
  <header>
    <div class="home-menu pure-menu pure-menu-horizontal">
      <a class="pure-menu-heading">FFXIV 日志解析工具</a>
      <nav class="pure-menu-list">
        <a class="pure-menu-item" href="#" target="_blank">帮助</a>
      </nav>
    </div>
  </header>

  <div class="container">
    <HomePage />
  </div>
  <footer>
    &copy; 2022
    <a href="https://ffxiv.cyou" target="_blank">狒狒西柚</a> | ALL FINAL
    FANTASY XIV CONTENT IS PROPERTY OF SQUARE ENIX CO., LTD
  </footer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";
import HomePage from "@/views/HomeView.vue";
@Component({
  components: {
    HomePage: HomePage,
  },
})
export default class App extends Vue {}
</script>

<style scoped>
.home-menu {
  background: #2d3e50;
  padding: 0.5em;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
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

header {
  height: 60px;
}

.container {
  margin: auto;
  padding: 0 1em;
  max-width: 1440px;
  min-height: calc(100vh - 90px);
}

footer {
  font-size: 14px;
  height: 30px;
  line-height: 30px;
  padding-left: 10px;
  background: #2d3e50;
  color: white;
}
footer a {
  text-decoration: none;
  color: white;
}
</style>
