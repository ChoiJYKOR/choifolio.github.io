import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'

export type SerializedCollapsibleNode = Spread<
  {
    title: string
    open: boolean
  },
  SerializedElementNode
>

export class CollapsibleNode extends ElementNode {
  __title: string
  __open: boolean

  static getType(): string {
    return 'collapsible'
  }

  static clone(node: CollapsibleNode): CollapsibleNode {
    return new CollapsibleNode(node.__title, node.__open, node.__key)
  }

  constructor(title: string, open: boolean, key?: NodeKey) {
    super(key)
    this.__title = title
    this.__open = open
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div')
    dom.setAttribute('data-lexical-collapsible', 'true')
    dom.className = 'my-2 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden'
    
    return dom
  }

  updateDOM(prevNode: CollapsibleNode, dom: HTMLElement, config: EditorConfig): boolean {
    return false // Lexical이 자동으로 자식 업데이트
  }
  
  static importDOM(): DOMConversionMap | null {
    return {
      details: (node: Node) => ({
        conversion: convertCollapsibleElement,
        priority: 3,
      }),
    }
  }
  
  exportDOM(): DOMExportOutput {
    const element = document.createElement('details')
    element.open = this.__open
    
    const summary = document.createElement('summary')
    summary.textContent = this.__title
    summary.className = 'px-4 py-2 cursor-pointer font-semibold'
    element.appendChild(summary)

    return { element }
  }

  static importJSON(serializedNode: SerializedCollapsibleNode): CollapsibleNode {
    const { title, open } = serializedNode
    const node = $createCollapsibleNode(title, open)
    
    // importJSON이 호출될 때 비어있으므로, 여기서 자식 추가하면 안 됨
    return node
  }

  exportJSON(): SerializedCollapsibleNode {
    return {
      ...super.exportJSON(),
      title: this.getTitle(),
      open: this.isOpen(),
      type: 'collapsible',
      version: 1,
    }
  }

  getTitle(): string {
    return this.getLatest().__title
  }

  setTitle(title: string): void {
    const writable = this.getWritable()
    writable.__title = title
  }

  isOpen(): boolean {
    return this.getLatest().__open
  }

  setOpen(open: boolean): void {
    const writable = this.getWritable()
    writable.__open = open
  }

  toggle(): void {
    this.setOpen(!this.isOpen())
  }
}

function convertCollapsibleElement(domNode: Node): DOMConversionOutput {
  const dom = domNode as HTMLDetailsElement
  const summary = dom.querySelector('summary')
  const title = summary ? summary.textContent || '' : ''
  const open = dom.open
  
  const node = $createCollapsibleNode(title, open)
  
  return { node }
}

export function $createCollapsibleNode(title: string, open: boolean): CollapsibleNode {
  return $applyNodeReplacement(new CollapsibleNode(title, open))
}

export function $isCollapsibleNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleNode {
  return node instanceof CollapsibleNode
}
