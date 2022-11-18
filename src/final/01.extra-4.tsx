// useReducer: simple Counter
// 💯 traditional dispatch object with a type and switch statement
// http://localhost:3000/isolated/final/01.extra-4.js

import * as React from 'react'

type CounterState = {
  count: number
}

type CounterAction = {
  type: 'increment'
  step: number
}

function countReducer(state: CounterState, action: CounterAction) {
  const { type, step } = action
  switch (type) {
    case 'increment': {
      return {
        ...state,
        count: state.count + step,
      }
    }
    default: {
      throw new Error(`Unsupported action type: ${action.type}`)
    }
  }
}

function Counter({ initialCount = 0, step = 1 }) {
  const [state, dispatch] = React.useReducer(countReducer, {
    count: initialCount,
  })
  const { count } = state
  const increment = () => dispatch({ type: 'increment', step })
  return <button onClick={increment}>{count}</button>
}

function App() {
  return <Counter />
}

export default App
