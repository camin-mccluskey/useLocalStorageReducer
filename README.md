# use-localstorage-reducer 

Sync the state of a React reducer with LocalStorage. Typesafe and SSR compatible.

## Installation

```bash
npm install use-localstorage-reducer
```

## Usage

```tsx
import { useLocalStorageReducer } from 'use-localstorage-reducer'

function App() {
  const [state, dispatch] = useLocalStorageReducer(
	'storage-key',
	reducerFunc,
  { name: '', age: 0}, // initial state
	[], // optional array of middleware functions
	[], // optional array of afterware functions
  {
    serializer: (value: S) => JSON.stringify(value), // optional serializer function
    deserializer?: (value: string) => JSON.parse(value), // optional deserializer function
    initializeWithValue: true // optional initialize with value from LocalStorage (default: true, set false for SSR)
  },
}
```

## License

MIT
