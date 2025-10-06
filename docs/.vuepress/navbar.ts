/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export default defineNavbarConfig([
  { text: '首页', link: '/' },
  // { text: '博客', link: '/blog/' },
  // { text: '标签', link: '/blog/tags/' },
  // { text: '归档', link: '/blog/archives/' },
  // { text: '分类', link: '/blog/categories/' },
  {
    text: '前端相关',
    items: [
      {
        text: '目录', link: '/notes/前端相关/index.md',
      },
      {
        text: 'vue', link: '/notes/前端相关/vue/index.md'
      },
      {
        text: 'js', link: '/notes/前端相关/js/index.md'
      }
    ]
  },
  {text:"个人简历",link:'/notes/个人简历/index.md'}
])
