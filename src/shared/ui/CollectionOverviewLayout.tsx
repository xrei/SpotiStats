import {
  type JSX,
  type ParentComponent,
  children,
  createContext,
  createRenderEffect,
  createSignal,
  onCleanup,
  useContext,
} from 'solid-js'

type SlotName = 'summary' | 'chart' | 'content'

type LayoutContextValue = {
  setSlot: (slot: SlotName, content: JSX.Element | undefined) => void
}

const LayoutContext = createContext<LayoutContextValue>()

const createSlotComponent = (slot: SlotName, label: string): ParentComponent => {
  const Slot: ParentComponent = (props) => {
    const ctx = useContext(LayoutContext)
    if (!ctx) {
      throw new Error(
        `CollectionOverviewLayout.${label} must be used within CollectionOverviewLayout`,
      )
    }

    const resolved = children(() => props.children)

    createRenderEffect(() => {
      ctx.setSlot(slot, resolved())
    })

    onCleanup(() => {
      ctx.setSlot(slot, undefined)
    })

    return null
  }

  return Slot
}

type LayoutComponent = ParentComponent & {
  Summary: ParentComponent
  Chart: ParentComponent
  Content: ParentComponent
}

const CollectionOverviewLayout = ((props) => {
  const [summary, setSummary] = createSignal<JSX.Element>()
  const [chart, setChart] = createSignal<JSX.Element>()
  const [content, setContent] = createSignal<JSX.Element>()

  const setSlot: LayoutContextValue['setSlot'] = (slot, slotContent) => {
    switch (slot) {
      case 'summary':
        setSummary(() => slotContent)
        break
      case 'chart':
        setChart(() => slotContent)
        break
      case 'content':
        setContent(() => slotContent)
        break
    }
  }

  return (
    <LayoutContext.Provider value={{setSlot}}>
      {props.children}
      <div class="flex flex-1 flex-col overflow-y-auto p-4">
        <div class="grid gap-4 md:h-full lg:grid-cols-8">
          <div class="flex min-h-0 flex-col gap-4 lg:col-span-3">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
              {summary()}
            </div>
            {chart()}
          </div>

          <div class="flex h-full max-h-[500px] min-h-0 flex-col md:max-h-none lg:col-span-5">
            {content()}
          </div>
        </div>
      </div>
    </LayoutContext.Provider>
  )
}) as LayoutComponent

CollectionOverviewLayout.Summary = createSlotComponent('summary', 'Summary')
CollectionOverviewLayout.Chart = createSlotComponent('chart', 'Chart')
CollectionOverviewLayout.Content = createSlotComponent('content', 'Content')

export {CollectionOverviewLayout}
