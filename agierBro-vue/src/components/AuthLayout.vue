<template>
  <div class="auth-layout">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">{{ title }}</h1>
        <p class="auth-subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="auth-body">
        <slot></slot>
      </div>
      
      <div class="auth-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: var(--bg-color);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-color-elevated);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.auth-header {
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-active));
  color: #fff;
}

.auth-title {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-2xl);
  font-weight: 700;
}

.auth-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.auth-body {
  padding: var(--spacing-xl) var(--spacing-lg);
}

.auth-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-color-secondary);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-color-secondary);
}

/* 移动端优化 */
@media (max-width: 576px) {
  .auth-layout {
    padding: var(--spacing-sm);
  }
  
  .auth-card {
    max-width: 100%;
  }
  
  .auth-title {
    font-size: var(--font-size-xl);
  }
}
</style>
