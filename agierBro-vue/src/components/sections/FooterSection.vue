<template>
  <footer class="section section-footer">
    <div class="footer-content">
      <div class="footer-copyright" v-if="data.copyright">
        {{ data.copyright }}
      </div>
      <nav class="footer-links" v-if="data.links">
        <a
          v-for="(link, index) in data.links"
          :key="index"
          :href="link.url"
          class="footer-link"
        >
          {{ link.title }}
        </a>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { DataObject } from '@/types'

defineProps<{
  data: DataObject
}>()
</script>

<style scoped>
.section-footer {
  background: #1d1d1f;
  color: #e8e8e8;
  padding: 40px 24px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.footer-copyright {
  font-size: 14px;
  color: #86868b;
}

.footer-links {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: #e8e8e8;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #fff;
}
</style>
