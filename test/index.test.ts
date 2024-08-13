import { describe, expect, it } from 'bun:test'
import { renderHook } from '@testing-library/react'
import { useLocalStorageReducer } from '../src/'

describe('should', () => {
	it('example', () => {
		const { result } = renderHook(
			() =>
				useLocalStorageReducer(
					'key',
					(state: number, action: { type: 'inc' }) => state,
					0,
				),
			{ hydrate: true },
		)
		const [state, dispatch] = result.current
		expect(state).toBe(0)
	})
})

// act(() => {
//     result.current.dispatch()
//   })
