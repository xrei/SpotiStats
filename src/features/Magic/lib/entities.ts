import type {Entity, EntityType} from '../types'

export const Entities = {
  Album: 'album',
  Artist: 'artist',
  Track: 'track',
} as const

export function getEntityId(entity: Entity, entityType: EntityType): string {
  switch (entityType) {
    case 'album':
      return 'id' in entity ? entity.id : ''
    case 'artist':
      return 'name' in entity ? entity.name : ''
    case 'track':
      return 'id' in entity ? entity.id : ''
    default:
      return ''
  }
}
