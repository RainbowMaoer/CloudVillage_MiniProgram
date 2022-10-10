export default function stringToNodes(keyword, value) {
  // 这里网易返回的数据都是匹配的前面一部分, 我们就切割前面一部分
  // 如果想匹配中间, 就需要用到正则
  const nodes = []
  // startsWith -> ES6新增的语法, 判断一个字符串是否以某个字符开头
  // 我们这里直接使用searchValue的原因是, 这就是一个闭包, 可以直接使用外层作用域的变量
  if (keyword.toUpperCase().startsWith(value.toUpperCase())) {
    const key1 = keyword.slice(0, value.length)
    const node1 = {
      name: 'span',
      attrs: { style: 'color: #26ce8a; font-size: 14px' },
      children: [{ type: 'text', text: key1 }]
    }
    nodes.push(node1)

    const key2 = keyword.slice(value.length)
    const node2 = {
      name: 'span',
      attrs: { style: 'color: #000000; font-size: 14px' },
      children: [{ type: 'text', text: key2 }]
    }
    nodes.push(node2)
  } else {
    const node = {
      name: 'span',
      attrs: { style: 'color: #000000; font-size: 14px' },
      children: [{ type: 'text', text: keyword }]
    }
    nodes.push(node)
  }
  return nodes
}
