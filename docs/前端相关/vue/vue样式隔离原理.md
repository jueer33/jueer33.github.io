# vue样式隔离原理
平时使用的时候都有使用过scoped来进行实现不同组件之间的样式隔离，但是底层vue是如何实现的呢？
## scoped
在使用组件的时候，给style加上scoped，在编译的时候会根据改组件的**路径和内容**生成唯一的哈希值
```vue
<template>
  <div class="box">
    <p class="text">Hello</p>
  </div>
</template>

<style scoped>
.box {
  border: 1px solid red;
}
.text {
  color: blue;
}
</style>

```
**修改 CSS 选择器**，在编译阶段为每条样式规则加上 `[data-v-123abc]` 限定：
```css
.box[data-v-123abc] {
  border: 1px solid red;
}
.text[data-v-123abc] {
  color: blue;
}
```
在vue渲染模板的时候会自动给该组件模板的根元素及其子元素自动加上这个唯一 id 属性：
<div class="box" data-v-123abc45></div>
<div class="box" data-v-123abc45></div>
<div class="box" data-v-123abc45></div>
```html
<div class="box" data-v-123abc>
  <p class="text" data-v-123abc>Hello</p>
</div>
```

## v-deep

在父组件中要修改子组件的样式可以使用v-deep或者:deep()
**父组件 `Parent.vue`**
```vue
<template>
  <div class="parent">
    <Child />
  </div>
</template>

<script setup>
import Child from './Child.vue'
</script>

<style scoped>
/* ① 普通 scoped：只影响 Parent 自己的 .title */
.title {
  color: red;
}

/* ② 使用 v-deep：可以穿透到子组件里的 .title */
::v-deep(.title) {
  color: blue;
}
</style>
```

**子组件 `Child.vue`**

```vue
<template>
  <div class="child">
    <p class="title">我是子组件的标题</p>
  </div>
</template>

<style scoped>
.title {
  font-weight: bold;
}
</style>
```

### 不加 v-deep

编译后的 CSS（假设 Parent 是 `data-v-111`，Child 是 `data-v-222`）：

```css
.title[data-v-111] { color: red; }   /* 父组件的 scoped */
.title[data-v-222] { font-weight: bold; }  /* 子组件的 scoped */
```

DOM：

```html
<div class="child" data-v-222>
  <p class="title" data-v-222>我是子组件的标题</p>
</div>
```

子组件的 `.title` **只匹配到 `[data-v-222]`**，父组件的样式不会生效。  
最终显示：**黑色粗体**。

---

### 加 v-deep

编译后的 CSS：

```css
[data-v-111] .title { color: blue; }   /* v-deep 穿透 */
.title[data-v-222] { font-weight: bold; }  /* 子组件 */
```

DOM 一样：

```html
<div class="child" data-v-222>
  <p class="title" data-v-222>我是子组件的标题</p>
</div>
```
结果：`.title` 匹配到了 **父组件作用域内的所有子元素**，即使它属于子组件，也能被选中。 
最终显示：**蓝色粗体**。

**相当于原本的父组件的[data-v-111]是在title后面的，只会匹配title为[data-v-11]的样式，加了后会把[data-v-111]提前，匹配的是[data-v-111]属性下所有的title样式，而子组件title是父组件的子节点，可以实现匹配**
