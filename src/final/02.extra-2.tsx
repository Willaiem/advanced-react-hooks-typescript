// useCallback: custom hooks
// 💯 return a memoized `run` function from useAsync
// http://localhost:3000/isolated/final/02.extra-2.js

import * as React from 'react'
import {
  fetchPokemon, PokemonDataView, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback
} from '../pokemon'
import { PokemonData } from '../types'

type AsyncState<DataType> =
  | {
    status: 'idle' | 'pending'
    data?: null
    error?: null
  }
  | {
    status: 'resolved'
    data: DataType
    error: null
  }
  | {
    status: 'rejected'
    data: null
    error: Error
  }

type AsyncAction<DataType> =
  | { type: 'reset' }
  | { type: 'pending' }
  | { type: 'resolved'; data: DataType }
  | { type: 'rejected'; error: Error }


function asyncReducer<DataType>(
  state: AsyncState<DataType>,
  action: AsyncAction<DataType>,
): AsyncState<DataType> {
  switch (action.type) {
    case 'pending': {
      return { status: 'pending', data: null, error: null }
    }
    case 'resolved': {
      return { status: 'resolved', data: action.data, error: null }
    }
    case 'rejected': {
      return { status: 'rejected', data: null, error: action.error }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useAsync<DataType>(initialState: AsyncState<DataType>) {
  const [state, dispatch] = React.useReducer<
    React.Reducer<AsyncState<DataType>, AsyncAction<DataType>>
  >(asyncReducer, {
    data: null,
    error: null,
    ...initialState,
  })

  const { data, error, status } = state

  const run = React.useCallback((promise: Promise<DataType>) => {
    dispatch({ type: 'pending' })
    promise.then(
      data => {
        dispatch({ type: 'resolved', data })
      },
      error => {
        dispatch({ type: 'rejected', error })
      },
    )
  }, [])

  return {
    error,
    status,
    data,
    run,
  }
}

function PokemonInfo({ pokemonName }: { pokemonName: string }) {
  const { data: pokemon, status, error, run } = useAsync<PokemonData>({
    status: pokemonName ? 'pending' : 'idle',
  })

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
