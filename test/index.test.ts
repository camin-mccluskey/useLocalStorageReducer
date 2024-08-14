import { describe, expect, test, beforeEach, mock } from 'bun:test'
import { act, renderHook } from '@testing-library/react'
import { useLocalStorageReducer } from '../src/'

type TestAction =
	| { type: 'inc' }
	| { type: 'dec' }
	| { type: 'set'; value: number }
const TEST_LS_KEY = 'useLocalStorageReducer-test-key'
const TEST_INITIAL_STATE = 0
const TEST_REDUCER = (state: number, action: TestAction) => {
	const { type } = action
	switch (type) {
		case 'inc':
			return state + 1
		case 'dec':
			return state - 1
		case 'set':
			return action.value
		default:
			return type satisfies never
	}
}

describe('useLocalStorageReducer', () => {
	beforeEach(() => {
		window.localStorage.clear()
	})

	test('Initialises with LocalStorage value by default', () => {
		const TEST_LS_VALUE = 10
		window.localStorage.setItem(TEST_LS_KEY, TEST_LS_VALUE.toString())
		const { result } = renderHook(() =>
			useLocalStorageReducer(TEST_LS_KEY, TEST_REDUCER, TEST_INITIAL_STATE),
		)
		const [state] = result.current
		expect(state).toBe(TEST_LS_VALUE)
	})

	test('Initialises with LocalStorage value when initializeWithValue is true', () => {
		const TEST_LS_VALUE = 10
		window.localStorage.setItem(TEST_LS_KEY, TEST_LS_VALUE.toString())
		const { result } = renderHook(() =>
			useLocalStorageReducer(
				TEST_LS_KEY,
				TEST_REDUCER,
				TEST_INITIAL_STATE,
				[],
				[],
				{ initializeWithValue: true },
			),
		)
		const [state] = result.current
		expect(state).toBe(TEST_LS_VALUE)
	})

	test('Settles to LocalStorage value when initializeWithValue is false', () => {
		const TEST_LS_VALUE = 10
		window.localStorage.setItem(TEST_LS_KEY, TEST_LS_VALUE.toString())
		const { result } = renderHook(() =>
			useLocalStorageReducer(
				TEST_LS_KEY,
				TEST_REDUCER,
				TEST_INITIAL_STATE,
				[],
				[],
				{ initializeWithValue: false },
			),
		)
		const [state] = result.current
		expect(state).toBe(TEST_LS_VALUE)
	})

	const INITIAL_LS_VALUE = 10
	test.each([
		['inc' as const, INITIAL_LS_VALUE + 1],
		['dec' as const, INITIAL_LS_VALUE - 1],
		['set' as const, 99],
	])(
		'Persists (to LocalStorage) and returns new reducer state after action dispatch',
		(action, expectedValue) => {
			window.localStorage.setItem(TEST_LS_KEY, INITIAL_LS_VALUE.toString())
			const { result: beforeResult } = renderHook(() =>
				useLocalStorageReducer(
					TEST_LS_KEY,
					TEST_REDUCER,
					TEST_INITIAL_STATE,
					[],
					[],
				),
			)
			act(() => {
				const [, dispatch] = beforeResult.current
				if (action === 'set') {
					dispatch({ type: action, value: expectedValue })
				} else {
					dispatch({ type: action })
				}
			})
			const { result: afterResult } = renderHook(() =>
				useLocalStorageReducer(
					TEST_LS_KEY,
					TEST_REDUCER,
					TEST_INITIAL_STATE,
					[],
					[],
				),
			)
			const [state] = afterResult.current
			expect(state).toBe(expectedValue)
			const afterLSValue = window.localStorage.getItem(TEST_LS_KEY)
			expect(afterLSValue).toBe(expectedValue.toString())
		},
	)

	test('Runs middlewares on action', () => {
		const beforeFunc = mock((action: TestAction, state: number) =>
			console.log(
				'Beforeware running for action: ',
				action,
				'on state: ',
				state,
			),
		)
		const afterFunc = mock((action: TestAction, state: number) =>
			console.log(
				'Afterware running for action: ',
				action,
				'on state: ',
				state,
			),
		)
		const { result } = renderHook(() =>
			useLocalStorageReducer(
				TEST_LS_KEY,
				TEST_REDUCER,
				TEST_INITIAL_STATE,
				[beforeFunc],
				[afterFunc],
			),
		)
		act(() => {
			const [, dispatch] = result.current
			dispatch({ type: 'inc' })
		})
		expect(beforeFunc).toHaveBeenCalledTimes(1)
		expect(beforeFunc).toHaveBeenLastCalledWith(
			{ type: 'inc' },
			TEST_INITIAL_STATE,
		)
		expect(afterFunc).toHaveBeenCalledTimes(1)
		expect(afterFunc).toHaveBeenLastCalledWith(
			{ type: 'inc' },
			TEST_INITIAL_STATE,
		)
	})
})
