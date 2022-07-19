<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <router-view />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--primary);
}

:root {
  --primary: #2c3e50;
}

li {
  list-style: none;
}
ul {
  padding: 0px;
}

button {
  color: white;
  background-color: var(--primary);
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem;
  cursor: pointer;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: var(--primary);

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
