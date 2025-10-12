import {SearchInput, type SearchInputProps} from '@/shared/ui'
import type {FiltersModel} from '../model'
import {useUnit} from 'effector-solid'

type SearchFilterProps<Sort extends string> = SearchInputProps & {
  model: FiltersModel<Sort>
}

export const SearchFilter = <Sort extends string>({model, ...p}: SearchFilterProps<Sort>) => {
  const {$search, searchChanged} = useUnit(model.Search)

  return <SearchInput {...p} value={$search} onChange={searchChanged} />
}
