import { defineNoteConfig, defineNotesConfig } from 'vuepress-theme-plume'

const frontendNote = defineNoteConfig({
  dir: '前端相关',
  link: '/frontend/',
  sidebar: [
    {
      text: '前端相关',
      collapsed: true, // 前端相关标题可折叠
      items: 'auto'
    },
  ],
})

export default defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [frontendNote],
})