import { type Reducer, useCallback, useEffect } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import {
	type ReducerMiddlewareFn,
	useReducerWithMiddleware,
} from './useReducerWithMiddleware'
import { isInternalSyncAction } from './utils'

export const SYNC_ACTION_TYPE = '_sync'
export type SyncAction<S> = { type: typeof SYNC_ACTION_TYPE; payload: S }
type useLocalStorageReducerOptions<S> = {
	/** A function to serialize the value before storing it. */
	serializer?: (value: S) => string
	/** A function to deserialize the stored value. */
	deserializer?: (value: string) => S
	/**
	 * If `true` (default), the hook will initialize reading the local storage. In SSR, you should set it to `false`, returning the initial value initially.
	 */
	initializeWithValue?: boolean
}

export const useLocalStorageReducer = <S, A>(
	key: string,
	reducer: Reducer<S, A>,
	initialState: S | (() => S),
	middlewareFns: Array<ReducerMiddlewareFn<S, A>> = [],
	afterwareFns: Array<ReducerMiddlewareFn<S, A>> = [],
	options?: useLocalStorageReducerOptions<S>,
) => {
	const [savedState, setSavedState] = useLocalStorage<S>(
		key,
		initialState,
		options,
	)

	const localStorageReducer = useCallback(
		(state: S, action: A | SyncAction<S>) => {
			if (isInternalSyncAction(action)) {
				return action.payload
			}
			const newState = reducer(state, action as A)
			setSavedState(newState)
			return newState
		},
		[reducer, setSavedState],
	)

	const [_, _dispatch] = useReducerWithMiddleware(
		localStorageReducer,
		savedState,
		middlewareFns,
		afterwareFns,
	)

	// resync the reducer state with savedState
	useEffect(() => {
		_dispatch({ type: '_sync', payload: savedState })
	}, [savedState, _dispatch])

	// remove the ability for clients to reset state with internal type: '_sync' action
	const consumerDispatch = (action: A) => {
		_dispatch(action)
	}

	return [savedState, consumerDispatch] as const
}
