<template>
  <div class="p-4 border border-gray-200 rounded-lg bg-white">
    <h3 class="text-lg font-semibold mb-3 text-gray-900">
      Vue 主题切换岛屿
    </h3>
    <div class="space-y-3">
      <div class="flex items-center space-x-2">
        <label class="text-sm text-gray-700">选择主题:</label>
        <select 
          v-model="currentTheme" 
          @change="applyTheme"
          class="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="blue">蓝色</option>
        </select>
      </div>
      <div 
        class="p-3 rounded transition-colors"
        :class="themeClasses[currentTheme]"
      >
        <p class="text-sm">
          当前主题: <strong>{{ themeNames[currentTheme] }}</strong>
        </p>
        <p class="text-xs mt-1 opacity-75">
          这是一个 Vue 组件岛屿，展示响应式状态管理
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'blue'

const currentTheme = ref<Theme>('light')

const themeClasses = {
  light: 'bg-gray-100 text-gray-900',
  dark: 'bg-gray-800 text-white',
  blue: 'bg-blue-100 text-blue-900'
}

const themeNames = {
  light: '浅色主题',
  dark: '深色主题', 
  blue: '蓝色主题'
}

const applyTheme = () => {
  // 这里可以添加实际的主题切换逻辑
  console.log(`切换到主题: ${currentTheme.value}`)
}

onMounted(() => {
  // 从 localStorage 恢复主题设置
  const savedTheme = localStorage.getItem('theme') as Theme
  if (savedTheme && savedTheme in themeClasses) {
    currentTheme.value = savedTheme
  }
})
</script>