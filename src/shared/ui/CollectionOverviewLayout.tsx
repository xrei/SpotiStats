import {type ParentComponent} from 'solid-js'

type LayoutComponent = ParentComponent & {
  SidePanel: ParentComponent
  SummaryGroup: ParentComponent
  MainPanel: ParentComponent
}

const CollectionOverviewLayout = ((props) => (
  <div class="flex flex-1 flex-col overflow-y-auto p-4">
    <div class="grid gap-4 md:h-full lg:grid-cols-8">{props.children}</div>
  </div>
)) as LayoutComponent

CollectionOverviewLayout.SidePanel = (props) => (
  <div class="flex min-h-0 flex-col gap-4 lg:col-span-3">{props.children}</div>
)

CollectionOverviewLayout.SummaryGroup = (props) => (
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">{props.children}</div>
)

CollectionOverviewLayout.MainPanel = (props) => (
  <div class="flex h-full max-h-[500px] min-h-0 flex-col md:max-h-none lg:col-span-5">
    {props.children}
  </div>
)

export {CollectionOverviewLayout}
