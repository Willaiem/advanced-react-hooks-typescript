// useCallback: custom hooks
// http://localhost:3000/isolated/final/02.js

import * as React from 'react'
import {
  fetchPokemon, PokemonDataView, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback
} from '../pokemon'

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
) {
  switch (action.type) {
    case 'pending': {
      return { status: 'pending' as const, data: null, error: null }
    }
    case 'resolved': {
      return { status: 'resolved' as const, data: action.data, error: null }
    }
    case 'rejected': {
      return { status: 'rejected' as const, data: null, error: action.error }
    }
    default: {
      throw new Error(`Unhandled action: ${JSON.stringify(action)}`)
    }
  }
}

function useAsync<DataType>(asyncCallback: () => Promise<DataType> | undefined, initialState: AsyncState<DataType>, dependencies: React.DependencyList) {
  const [state, dispatch] = React.useReducer<
    React.Reducer<AsyncState<DataType>, AsyncAction<DataType>>
  >(asyncReducer, {
    data: null,
    error: null,
    ...initialState,
  })

  React.useEffect(() => {
    const promise = asyncCallback()
    if (!promise) {
      return
    }
    dispatch({ type: 'pending' })
    promise.then(
      data => {
        dispatch({ type: 'resolved', data })
      },
      error => {
        dispatch({ type: 'rejected', error })
      },
    )
    // too bad the eslint plugin can't statically analyze this :-(
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return state
}

function PokemonInfo({ pokemonName }: { pokemonName: string }) {
  const state = useAsync(
    () => {
      if (!pokemonName) {
        return
      }
      return fetchPokemon(pokemonName)
    },
    { status: pokemonName ? 'pending' : 'idle' },
    [pokemonName],
  )

  const { data: pokemon, status, error } = state

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
