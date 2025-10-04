declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'element-plus/es/locale/lang/zh-cn' {
  const zhCn: any;
  export default zhCn;
}

declare module 'element-plus/dist/locale/zh-cn.mjs' {
  const zhCn: any;
  export default zhCn;
}

