// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import type { Reducer as ReducerType } from 'react'
import * as React from 'react'
import {
  fetchPokemon, PokemonDataView, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback
} from '../pokemon'
import { PokemonData } from '../types'

type IStatus = 'idle' | 'pending' | 'resolved' | 'rejected'

type IRunAsync<T> = (promise?: Promise<T>) => Promise<T> | void

type IPokemonState = {
  status: IStatus
  data?: PokemonData | null
  error?: Error | null
}

type IUseAsyncReturns<T> = [IPokemonState, IRunAsync<T>]

type IPokemonAction =
  | {
    type: 'idle' | 'pending'
  }
  | {
    type: 'resolved'
    data: PokemonData
  }
  | {
    type: 'rejected'
    error: Error
  }

// 🐨 this is going to be our generic asyncReducer
function asyncReducer(
  state: IPokemonState,
  action: IPokemonAction,
): IPokemonState {
  switch (action.type) {
    case 'pending': {
      // 🐨 replace "pokemon" with "data"
      return { status: 'pending', data: null, error: null }
    }
    case 'resolved': {
      // 🐨 replace "pokemon" with "data" (in the action too!)
      return { status: 'resolved', data: action.data, error: null }
    }
    case 'rejected': {
      // 🐨 replace "pokemon" with "data"
      return { status: 'rejected', data: null, error: action.error }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

const useAsync = (
  initialState: IPokemonState,
): IUseAsyncReturns<PokemonData> => {
  // 🐨 so your job is to create a useAsync function that makes this work.
  const [state, dispatch] = React.useReducer<
    ReducerType<IPokemonState, IPokemonAction>
  >(asyncReducer, initialState)

  let mounted = React.useRef(false)

  React.useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  })

  const run = React.useCallback<IRunAsync<PokemonData>>(promise => {
    // 💰 this first early-exit bit is a little tricky, so let me give you a hint:
    if (!promise) {
      return
    }

    // then you can dispatch and handle the promise etc...
    dispatch({ type: 'pending' })
    promise.then(
      data => {
        if (!mounted.current) {
          return
        }
        dispatch({ type: 'resolved', data })
      },
      error => {
        if (!mounted.current) {
          return
        }
        dispatch({ type: 'rejected', error })
      },
    )

    // 🐨 you'll accept dependencies as an array and pass that here.
    // 🐨 because of limitations with ESLint, you'll need to ignore
    // the react-hooks/exhaustive-deps rule. We'll fix this in an extra credit.
  }, [])

  return [state, run]
}

function PokemonInfo({ pokemonName }: { pokemonName: string }) {
  // 🐨 move both the useReducer and useEffect hooks to a custom hook called useAsync
  // here's how you use it:
  const stateAsync = useAsync({
    status: pokemonName ? 'pending' : 'idle',
  })

  // 🐨 this will change from "pokemon" to "data"
  const [{ data: pokemon, status, error }, run] = stateAsync

  React.useEffect(() => {
    if (!pokemonName) {
      return
    }
    run(fetchPokemon(pokemonName))
  }, [pokemonName, run])

  switch (status) {
    case 'idle':
      return <span>Submit a pokemon</span>
    case 'pending':
      return <PokemonInfoFallback name={pokemonName} />
    case 'rejected':
      throw error
    case 'resolved':
      return <PokemonDataView pokemon={pokemon} />
    default:
      throw new Error('This should be impossible')
  }
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName: string) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
