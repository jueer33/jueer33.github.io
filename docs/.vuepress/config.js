import { viteBundler } from '@vuepress/bundler-vite'
import pkg from '@vuepress/theme-default'
const { defaultTheme } = pkg
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
    bundler: viteBundler(),
    theme: defaultTheme({
        navbar: [
            {
                text: "home",
                link: "/"
            },
            {
                text: "前端相关",
                prefix: "/前端相关/",
                children: [{
                    text: 'vue',
                    prefix: 'vue/',
                    children: ['vue2响应式原理.md',
                        'vue3响应式原理.md',
                        'vue的diff算法.md',
                        'vue样式隔离原理.md',
                        'keep-alive原理.md',
                        'vue press构建.md'
                    ]
                },
                {
                    text: "js",
                    prefix: "/2.js/",
                    children: []
                }]
            },
        ]
    }),
})
