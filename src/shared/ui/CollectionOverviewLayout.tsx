import {type ParentComponent} from 'solid-js'

type LayoutComponent = ParentComponent & {
  SidePanel: ParentComponent
  SummaryGroup: ParentComponent
  MainPanel: ParentComponent
}

const CollectionOverviewLayout = ((props) => (
  <div class="flex flex-1 overflow-hidden p-4 pt-0 pr-0">
    <div id="layout" class="flex min-h-0 flex-1 flex-col overflow-y-auto pt-4 pr-4">
      <div class="grid gap-4 md:h-full lg:grid-cols-8">{props.children}</div>
    </div>
  </div>
)) as LayoutComponent

CollectionOverviewLayout.SidePanel = (props) => (
  <div id="layout-side-panel" class="flex min-h-auto flex-col gap-4 lg:col-span-3">
    {props.children}
  </div>
)

CollectionOverviewLayout.SummaryGroup = (props) => (
  <div id="layout-summary" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
    {props.children}
  </div>
)

CollectionOverviewLayout.MainPanel = (props) => (
  <div
    id="layout-main-panel"
    class="flex h-full max-h-[500px] min-h-auto flex-col lg:col-span-5 lg:max-h-none lg:min-h-0"
  >
    {props.children}
  </div>
)

export {CollectionOverviewLayout}
