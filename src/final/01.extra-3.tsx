// useReducer: simple Counter
// 💯 simulate setState with an object OR function
// http://localhost:3000/isolated/final/01.extra-3.js

import * as React from 'react'

type CounterState = {
  count: number
}

type CounterAction = ((state: CounterState) => CounterState) | CounterState

const countReducer = (state: CounterState, action: CounterAction) => ({
  ...state,
  ...(typeof action === 'function' ? action(state) : action),
})

function Counter({ initialCount = 0, step = 1 }) {
  const [state, setState] = React.useReducer(countReducer, {
    count: initialCount,
  })
  const { count } = state
  const increment = () =>
    setState(currentState => ({ count: currentState.count + step }))
  return <button onClick={increment}>{count}</button>
}

function App() {
  return <Counter />
}

export default App
