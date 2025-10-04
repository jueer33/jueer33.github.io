# vue的diff算法
## 一、render和虚拟节点
在vue中渲染流程为：

> 模板 → render 函数 → 生成 VNode 树 → diff 新旧 VNode → patch 到真实 DOM

所以要知道diff算法首先要知道render函数和虚拟节点是什么
### 1.1 虚拟节点

虚拟节点（VNode, Virtual DOM Node）是对真实 DOM 的一种抽象表示。它用一个普通的 JavaScript 对象来描述 DOM 结构和属性。
Vue 在编译模板时会把模板编译成 render 函数，而 render 函数执行后返回的就是一颗 **VNode 树**。
**关键属性：** 
- `tag`：标记是元素还是组件
- `data`：存放属性、事件、指令等
- `children`：子 VNode 数组
- `text`：文本节点用
- `key`：列表 diff 过程中的唯一标识（很重要）
- `elm`：指向真实 DOM 元素，只有在 patch 挂载后才有
```js
{
  tag: 'div',              // 标签名，如果是组件则是组件的构造函数
  data: {                  // 数据对象 (属性/样式/事件)
    attrs: { id: 'app' },
    style: { color: 'red' },
    on: { click: fn }
  },
  children: [              // 子节点（VNode 数组）
    { tag: 'span', text: 'hello', ... },
    { tag: 'span', text: 'world', ... }
  ],
  text: undefined,         // 文本节点时才有值
  elm: undefined,          // 对应的真实 DOM，patch 阶段会填充
  key: 'xxx',              // key，diff 时用来优化复用
  componentOptions: null   // 如果是组件，会保存组件的配置信息
}

```
### 1.2 render函数

Vue 提供了一个 `h()` 函数用于创建 vnodes：[render函数](https://cn.vuejs.org/guide/extras/render-function)
`render()` 函数接收一个参数，即 Vue 的 `h` 函数（也称为 `createElement` 函数），用于创建虚拟 DOM 节点。[菜鸟教程](https://www.runoob.com/vue3/vue3-api-render.html)
```js
import { h } from 'vue'
export default {
  render(h) {
    return h('div', { class: 'container' }, 'Hello, Vue3!');
  }
}
```

## 二、vue2 diff
> diff 算法的实现就是：对比新旧虚拟节点（VNode 树），找到最小的差异，然后有选择地更新真实 DOM，而不是全部重建。
### 2.1 对比更新流程

由deepseek生成流程图如下：
[由deepseek生成流程图](./attachments/image-1.pdf)
每次都从根节点开始比较，
* 如果key值相同就复用这个根节点，把新节点的elm指向旧节点中的所指向的真实节点，
* 如果不相同就弃用原来的节点重新新建节点，如果key值相同的情况下还要比对它的子节点，由于子节点是数组，在这里vue的比对原则是尽量不新增不移动原来的节点
设置四个指针，分别指向新旧节点的头尾指针，`OldHead,OldTail,NewHead,NewTail`
1. **头头比较**
	- `OldHead` vs `NewHead`
	- 如果 `key` 相同 → 说明节点位置没变，直接 patch 并递归比对子节点
	- 两个指针同时右移
2. **尾尾比较**
	- `OldTail` vs `NewTail`
	- 如果 `key` 相同 → 说明尾部节点没变，直接 patch 并递归比对子节点
	- 两个指针同时左移
3. **交叉比较（头尾、尾头）**
	- **旧头 vs 新尾**
	    - 如果相同 → 说明节点从前移到后
	    - 直接 patch 并移动 DOM 到尾部位置
	    - `OldHead++`，`NewTail--`
	- **旧尾 vs 新头**
	    - 如果相同 → 说明节点从后移到前
	    - 直接 patch 并移动 DOM 到头部位置
	    - `OldTail--`，`NewHead++`
4. 四个快速路径都没命中 → keyMap 查找
	- 用新节点的 key 去旧节点里查找
	- 如果找到了：说明这个节点可以复用，直接移动并 patch
	- 如果没找到：说明是新节点，创建新 DOM 插入
5. 遍历结束后的收尾操作
	- **旧节点数组还有剩余** → 说明这些节点不需要了，直接移除
	- **新节点数组还有剩余** → 说明是新增节点，依次创建并插入
## 三、vue3
Vue3 相比 Vue2 在 **核心思想上相同（新旧 VNode 树比对，最小化 DOM 操作）**，但做了两大优化：
- **静态标记**（PatchFlag） → 减少无关节点的比对
- **最长递增子序列（LIS）优化** → 减少不必要的 DOM 移动

### 3.1 Vue3 Diff 流程

在 Vue3 中，依旧是从根节点开始：
1. **根节点比较**
    - 如果 `type`（标签名 / 组件类型）不同 → 直接卸载旧节点，新建新节点。
    - 如果相同 → 复用 DOM，并对比 `props`（属性）、`children`（子节点）。
2. **子节点比对：分 3 种情况**
    - **文本节点** → 直接更新 `textContent`。
    - **数组节点** → 执行 `patchKeyedChildren`（核心 diff 算法）。
    - **空节点 → 非空** / **非空 → 空** → 直接插入 / 删除。
3. **数组节点的 diff（patchKeyedChildren）**
    1. **前后指针对比**
        - `oldHead` vs `newHead` → 相同则递归 patch，指针右移。
        - `oldTail` vs `newTail` → 相同则递归 patch，指针左移。
    2. **前后指针没有对比成功→ 进入乱序比对：**
        - 构建 **新子节点的 key → index 映射表**。
        - 遍历旧子节点，看是否能在新表中找到：
            - 找到 → 说明可复用，打上“位置变更”标记。
            - 找不到 → 说明节点被删除。
    3. **根据映射表生成映射序列**
        - 得到一组“新节点的对应旧节点下标数组”。
        - 在这组数组上运行 **最长递增子序列（LIS）算法**，得到哪些节点“顺序没变”。
    4. **移动节点 & 新建节点**
        - LIS 里的节点 → 顺序正确，不需要移动。
        - 不在 LIS 里的节点 → 要么是新增（创建），要么是已有节点需要移动。
4. **收尾处理**
    - 新数组比旧数组长 → 创建多出来的新节点。
    - 新数组比旧数组短 → 删除多余的旧节点。
### 3.2 vue2 vs Vue3 的关键区别
Vue2 的 diff 算法采用四指针逐步比对并即时移动节点，可能导致较多的 DOM 操作；而 Vue3 在比对中先确定复用关系，再通过最长递增子序列找出无需移动的节点，最后统一移动和新增删除，从而最大限度减少 DOM 操作并结合静态标记优化性能。
- **Vue2**
    - 采用 **四指针法**（`OldHead`、`OldTail`、`NewHead`、`NewTail`）。
    - 每次比对时，尝试通过头头、尾尾、交叉比对来找到可以复用的节点。
    - 一旦找到可复用的节点，就立即移动指针并进行 patch 操作。
    - 整个过程中，节点的移动是 **逐步完成的**。
- **Vue3**
    - 依旧会做前后指针对比来处理头尾部分快速命中的情况。
    - 进入乱序比对阶段时，不会立即移动 DOM。
    - 而是先 **通过 key 建立映射表**，找出哪些旧节点能复用。
    - 再生成新旧节点的对应下标序列，利用 **最长递增子序列（LIS）算法** 找出“顺序没变的节点”。
    - 最后 **统一执行节点移动和新增删除操作**，减少了 DOM 的频繁操作。

| 特性       | Vue2                   | Vue3                              |
| -------- | ---------------------- | --------------------------------- |
| **比对方式** | 四指针（头尾 + 交叉对比）+ keyMap | 先前后指针 → 剩余乱序比对 + **LIS 优化**       |
| **性能优化** | 只做双端比对，可能频繁移动节点        | **最长递增子序列**，尽量减少 DOM 移动           |
| **静态优化** | 无                      | **PatchFlag** 静态标记：跳过不需要 diff 的节点 |


