// useReducer: simple Counter
// http://localhost:3000/isolated/final/01.js

import * as React from 'react'

type CounterState = number

const countReducer = (state: CounterState, newState: CounterState) => newState

function Counter({ initialCount = 0, step = 1 }) {
  const [count, setCount] = React.useReducer(countReducer, initialCount)
  const increment = () => setCount(count + step)
  return <button onClick={increment}>{count}</button>
}

function App() {
  return <Counter />
}

export default App
