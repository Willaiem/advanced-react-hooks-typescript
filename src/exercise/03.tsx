// useContext: simple Counter
// http://localhost:3000/isolated/exercise/03.js

import {createContext, FunctionComponent, useContext, useState} from 'react'

// 🐨 create your CountContext here with React.createContext
const CountContext = createContext<
  [number, React.Dispatch<React.SetStateAction<number>>]
>(null)

const useCount = (): [number, React.Dispatch<React.SetStateAction<number>>] => {
  try {
    const [count, setCount] = useContext(CountContext)
    return [count, setCount]
  } catch (err) {
    throw new Error('UseCount must be used within a CountProvider.')
  }
}

const CountProvider: FunctionComponent = ({children}) => {
  const [count, setCount] = useState(0)

  const value: [number, React.Dispatch<React.SetStateAction<number>>] = [
    count,
    setCount,
  ]

  return <CountContext.Provider value={value}>{children}</CountContext.Provider>
}

// 🐨 create a CountProvider component here that does this:
//   🐨 get the count state and setCount updater with React.useState
//   🐨 create a `value` array with count and setCount
//   🐨 return your context provider with the value assigned to that array and forward all the other props
//   💰 more specifically, we need the children prop forwarded to the context provider

function CountDisplay() {
  // 🐨 get the count from useContext with the CountContext
  const [count] = useCount()

  return <div>{`The current count is ${count}`}</div>
}

function Counter() {
  // 🐨 replace the fake implementation of setCount with what you get back from useContext with the CountContext
  const [_, setCount] = useCount()

  const increment = () => setCount(c => c + 1)
  return <button onClick={increment}>Increment count</button>
}

function App() {
  return (
    <div>
      {/*
        🐨 wrap these two components in the CountProvider so they can access
        the CountContext value
      */}
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  )
}

export default App
