import { describe, expect, test } from 'bun:test'
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
	test('Initialises with Local Storage value by default', () => {
		const { result } = renderHook(() =>
			useLocalStorageReducer(TEST_LS_KEY, TEST_REDUCER, TEST_INITIAL_STATE),
		)
		const [state, _] = result.current
		expect(state).toBe(0)
	})

	test('Initialises with Local Storage value when initializeWithValue is true', () => {
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
		const [state, _] = result.current
		expect(state).toBe(0)
	})

	test('Initialises with initial value when initializeWithValue is false', () => {
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
		const [state, _] = result.current
		expect(state).toBe(0)
	})
})

// act(() => {
//     result.current.dispatch()
//   })
