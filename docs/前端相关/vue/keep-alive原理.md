# keep-alive原理
在vue3中keep-alive可以实现组件的缓存，是 Vue 内置的抽象组件，用来 **缓存组件的实例**，避免重复创建和销毁，从而保留组件的状态（比如表单输入、滚动位置等）。

1. **抽象组件**
    - `keep-alive` 自己不会渲染真实 DOM，只是包裹子组件。
    - Vue 内部通过 `abstract: true` 标记它，不会影响父子关系。

2. **缓存机制（cache Map）**
    - 内部维护一个 `cache`（通常是 `Map` 或 `Object`）。
    - key：由组件的 `name` + `key` 生成。
    - value：组件的 **VNode + 组件实例**。

3. **首次渲染**:当子组件第一次被渲染时： keep-alive 会把生成的 VNode 和实例存到 cache 里。

4. **再次激活**:当切换回来时，不会重新 mount，而是直接从 cache 里取出之前的实例和 DOM，执行 activated 钩子，而不是 created/mounted。

5. **失活**（inactive）:被切换走的组件不会销毁，而是执行 deactivated 钩子，DOM 会被移动到一个隐藏的容器里（storage container）。

6. **LRU 策略（max 缓存数）**:如果设置了 :max，缓存超过数量会使用 LRU（最近最少使用） 策略，把最久未访问的实例销毁，腾出空间。