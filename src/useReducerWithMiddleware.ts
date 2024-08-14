import { useCallback, useReducer } from 'react'
import type { SyncAction } from '.'
import { isInternalSyncAction } from './utils'

type AugmentedReducer<S, A> = (state: S, action: A | SyncAction<S>) => S
export type ReducerMiddlewareFn<S, A> = (action: A, state: S) => void

export const useReducerWithMiddleware = <S, A>(
	reducer: AugmentedReducer<S, A>,
	initialState: S,
	middlewareFns: Array<ReducerMiddlewareFn<S, A>>,
	afterwareFns: Array<ReducerMiddlewareFn<S, A>>,
) => {
	const [state, dispatch] = useReducer(reducer, initialState)

	const dispatchWithMiddleware = useCallback(
		(action: A | SyncAction<S>) => {
			for (const mFn of middlewareFns) {
				!isInternalSyncAction(action) && mFn(action, state)
			}
			dispatch(action)
			for (const aFn of afterwareFns) {
				!isInternalSyncAction(action) && aFn(action, state)
			}
		},
		[middlewareFns, afterwareFns, state],
	)

	return [state, dispatchWithMiddleware] as const
}
