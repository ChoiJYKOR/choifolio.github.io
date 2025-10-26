import {
  $applyNodeReplacement,
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'

export type SerializedImageNode = Spread<
  {
    src: string
    altText: string
    width?: number
    height?: number
  },
  SerializedElementNode
>

export class ImageNode extends ElementNode {
  __src: string
  __altText: string
  __width?: number
  __height?: number

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__height, node.__key)
  }

  constructor(src: string, altText: string, width?: number, height?: number, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width
    this.__height = height
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: (domNode: Node) => {
          const img = domNode as HTMLImageElement
          const { src, alt, width, height } = img
          const node = $createImageNode(src, alt || '', width || undefined, height || undefined)
          return { node }
        },
        priority: 0,
      }),
    }
  }

  exportDOM(): HTMLElement {
    const img = document.createElement('img')
    img.src = this.__src
    img.alt = this.__altText
    if (this.__width) img.width = this.__width
    if (this.__height) img.height = this.__height
    img.className = 'max-w-full rounded-lg'
    return img
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, width, height } = serializedNode
    const node = $createImageNode(src, altText, width, height)
    return node
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      type: 'image',
      version: 1,
    }
  }

  getSrc(): string {
    return this.getLatest().__src
  }

  setSrc(src: string): void {
    const writable = this.getWritable()
    writable.__src = src
  }

  getAltText(): string {
    return this.getLatest().__altText
  }

  setAltText(altText: string): void {
    const writable = this.getWritable()
    writable.__altText = altText
  }

  createDOM(config: EditorConfig): HTMLElement {
    const img = document.createElement('img')
    img.src = this.__src
    img.alt = this.__altText
    if (this.__width) img.width = this.__width
    if (this.__height) img.height = this.__height
    img.className = 'max-w-full rounded-lg'
    return img
  }

  updateDOM(prevNode: ImageNode, dom: HTMLElement, config: EditorConfig): boolean {
    if (prevNode.__src !== this.__src) {
      return true
    }
    if (prevNode.__altText !== this.__altText) {
      return true
    }
    if (prevNode.__width !== this.__width || prevNode.__height !== this.__height) {
      return true
    }
    return false
  }
}

export function $createImageNode(src: string, altText: string, width?: number, height?: number): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, width, height))
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}

