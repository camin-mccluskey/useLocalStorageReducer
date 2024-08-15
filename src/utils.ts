import { SYNC_ACTION_TYPE, type SyncAction } from '.'

export const isInternalSyncAction = <S, A>(
	action: A | SyncAction<S>,
): action is SyncAction<S> => {
	return (
		!!action &&
		typeof action === 'object' &&
		'type' in action &&
		action.type === SYNC_ACTION_TYPE
	)
}
