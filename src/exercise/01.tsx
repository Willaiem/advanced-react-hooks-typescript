// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

type ICount = {
  count: number
}

type ICountAction = {
  type: 'INCREMENT' | 'DECREMENT'
  step: number
}

function countReducer(prevCount: ICount, action: ICountAction): ICount {
  switch (action.type) {
    case 'INCREMENT':
      return { count: prevCount.count + action.step }
    case 'DECREMENT':
      return { count: prevCount.count - action.step }
    default:
      return prevCount
  }
}

function Counter({ initialCount = 0, step = 1 }: { initialCount?: number, step?: number }) {
  // 🐨 replace React.useState with React.useReducer.
  // 💰 React.useReducer(countReducer, initialCount)
  const expensiveCount = () => {
    return 0
  }

  const init = () => {
    return {
      count: expensiveCount(),
    }
  }

  const [{ count }, dispatch] = React.useReducer(
    countReducer,
    {
      count: initialCount,
    },
    init,
  )

  // 💰 you can write the countReducer function so you don't have to make any
  // changes to the next two lines of code! Remember:
  // The 1st argument is called "state" - the current value of count
  // The 2nd argument is called "newState" - the value passed to setCount

  const increment = () =>
    dispatch({
      type: 'INCREMENT',
      step,
    })
  const decrement = () =>
    dispatch({
      type: 'DECREMENT',
      step,
    })
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}

function App() {
  return <Counter />
}

export default App
