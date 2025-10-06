/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export default defineNavbarConfig([
  { text: '首页', link: '/' },
  { text: '博客', link: '/blog/' },
  // { text: '标签', link: '/blog/tags/' },
  { text: '归档', link: '/blog/archives/' },
  { text: '分类', link: '/blog/categories/' },
  {
    text: '前端相关',
    items: [
      {
        text: 'vue', items: [
          { text: '1.vue2响应式原理', link: '/前端相关/vue/1.vue2响应式原理' },
          { text: '2.vue3响应式原理', link: '/前端相关/vue/2.vue3响应式原理' },
          { text: '3.vue的diff算法', link: '/前端相关/vue/3.vue的diff算法' },
          { text: '4.keep-alive原理', link: '/前端相关/vue/4.keep-alive原理' },
          { text: '5.vue样式隔离原理', link: '/前端相关/vue/5.vue样式隔离原理' },
          { text: '6.vue press构建', link: '/前端相关/vue/6.vue press构建' },
          { text: '7.vuepress plume主题', link: '/前端相关/vue/7.vuepress plume主题' }
        ]
      }
    ]
  },
])
