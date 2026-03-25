/**
 * 图片懒加载指令
 * 
 * 使用示例:
 * <img v-lazy="imageUrl" alt="" />
 */

export const vLazy = {
  mounted(el: HTMLImageElement, binding: { value: string }) {
    // 使用 Intersection Observer API
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = binding.value
            observer.unobserve(img)
          }
        })
      }, {
        rootMargin: '50px 0px'
      })

      observer.observe(el)
      
      // 存储 observer 以便卸载时清理
      ;(el as any)._lazyObserver = observer
      
      // 设置占位符
      el.style.minHeight = '200px'
      el.style.background = '#f5f5f5'
    } else {
      // 不支持 Intersection Observer 则直接加载
      el.src = binding.value
    }
  },
  
  beforeUnmount(el: HTMLImageElement) {
    if ((el as any)._lazyObserver) {
      ;(el as any)._lazyObserver.disconnect()
    }
  }
}

/**
 * 虚拟滚动组件
 * 
 * 用于大数据列表渲染
 * 
 * 使用示例:
 * <VirtualList :items="largeList" :itemHeight="50" :height="400">
 *   <template #default="{ item }">
 *     <div>{{ item.name }}</div>
 *   </template>
 * </VirtualList>
 */
