<template>
  <header class="section section-nav">
    <div class="nav-content">
      <div class="nav-logo">
        <span v-if="data.icon">{{ data.icon }}</span>
        <span v-if="data.title">{{ data.title }}</span>
      </div>
      <nav class="nav-links" v-if="data.links">
        <a
          v-for="(link, index) in data.links"
          :key="index"
          :href="link.url"
          class="nav-link"
        >
          <span v-if="link.icon" class="link-icon">{{ link.icon }}</span>
          {{ link.title }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { DataObject } from '@/types'

defineProps<{
  data: DataObject
}>()
</script>

<style scoped>
.section-nav {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 48px;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: #e8e8e8;
  text-decoration: none;
  font-size: 12px;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link:hover {
  color: #fff;
}

.link-icon {
  font-size: 14px;
}
</style>
