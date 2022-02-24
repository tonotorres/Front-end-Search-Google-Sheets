<template>
  <div id="app">
    <nav class="navbar navbar-light bg-light">
      <img class="responsive-logo" src="../logoRoche.png" alt="">
      <a class="navbar-brand" href="#">
        ROCHE ORACLE EPICX SEARCH
      </a>
    </nav>
    <Aplication/>
  </div>
</template>

<script>
import Aplication from './components/Aplication.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'jquery/src/jquery.js'
import 'bootstrap/dist/js/bootstrap.min.js'

export default {
  name: 'App',
  components: {
    Aplication
  },
  beforeMount(){
  },
  data(){
    return {

    }
  }
}
</script>

<style>
@import'~bootstrap/dist/css/bootstrap.css';

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.navbar-brand{
  padding-left: 30px;
}
.navbar {
  margin-bottom: 50px;
  display: flex;
  align-items: stretch;
  justify-content:flex-start !important;
}
.responsive-logo{
  padding-left: 20px;
  width: 10%;
  height: auto;
}
</style>
