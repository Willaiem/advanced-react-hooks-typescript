// useContext: Caching response data in context
// 💯 caching in a context provider (exercise)
// http://localhost:3000/isolated/exercise/03.extra-2.js

// you can edit this here and look at the isolated page or you can copy/paste
// this in the regular exercise file.

import type { Reducer as ReducerType } from 'react'
import * as React from 'react'
import { createContext } from 'react'
import {
  fetchPokemon, PokemonDataView, PokemonErrorBoundary, PokemonForm, PokemonInfoFallback
} from '../pokemon'
import type { PokemonData } from '../types'
import { useAsync } from '../utils'

// 🐨 Create a PokemonCacheContext
const PokemonCacheContext = createContext<
  [IReducerCacheState, React.Dispatch<IReducerCacheAction>] | null
>(null)

const PokemonCacheProvider: React.FunctionComponent = ({ children }) => {
  const [state, dispatch] = React.useReducer<
    ReducerType<IReducerCacheState, IReducerCacheAction>
  >(pokemonCacheReducer, {})

  const value: [IReducerCacheState, React.Dispatch<IReducerCacheAction>] = [
    state,
    dispatch,
  ]

  return (
    <PokemonCacheContext.Provider value={value}>
      {children}
    </PokemonCacheContext.Provider>
  )
}

// 🐨 create a PokemonCacheProvider function
// 🐨 useReducer with pokemonCacheReducer in your PokemonCacheProvider
// 💰 you can grab the one that's in PokemonInfo
// 🐨 return your context provider with the value assigned to what you get back from useReducer
// 💰 value={[cache, dispatch]}
// 💰 make sure you forward the props.children!

type IReducerCacheState = {
  pokemonName?: string
}

type IReducerCacheAction = {
  type: 'ADD_POKEMON'
  pokemonName: string
  pokemonData: PokemonData
}

function pokemonCacheReducer(
  state: IReducerCacheState,
  action: IReducerCacheAction,
) {
  switch (action.type) {
    case 'ADD_POKEMON': {
      return { ...state, [action.pokemonName]: action.pokemonData }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

type PokemonInfoProps = {
  pokemonName: string
}

function PokemonInfo({ pokemonName }: PokemonInfoProps) {
  // 💣 remove the useReducer here (or move it up to your PokemonCacheProvider)
  const [cache, dispatch] = React.useContext(PokemonCacheContext)

  // 🐨 get the cache and dispatch from useContext with PokemonCacheContext

  const { data: pokemon, status, error, run, setData } = useAsync<PokemonData>()

  React.useEffect(() => {
    if (!pokemonName) {
      return
    } else if (cache[pokemonName]) {
      const c = cache[pokemonName]
      setData(c)
    } else {
      run(
        fetchPokemon(pokemonName).then(pokemonData => {
          dispatch({ type: 'ADD_POKEMON', pokemonName, pokemonData })
          return pokemonData
        }),
      )
    }
  }, [cache, dispatch, pokemonName, run, setData])

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

type PreviousPokemonProps = {
  onSelect: (pokemonName: string) => void
}

function PreviousPokemon({ onSelect }: PreviousPokemonProps) {
  // 🐨 get the cache from useContext with PokemonCacheContext
  const [cache] = React.useContext(PokemonCacheContext)

  return (
    <div>
      Previous Pokemon
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {Object.keys(cache).map(pokemonName => (
          <li key={pokemonName} style={{ margin: '4px auto' }}>
            <button
              style={{ width: '100%' }}
              onClick={() => onSelect(pokemonName)}
            >
              {pokemonName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

type PokemonSectionProps = {
  onSelect: (pokemonName: string) => void
  pokemonName: string
}

function PokemonSection({ onSelect, pokemonName }: PokemonSectionProps) {
  // 🐨 wrap this in the PokemonCacheProvider so the PreviousPokemon
  // and PokemonInfo components have access to that context.
  return (
    <div style={{ display: 'flex' }}>
      <PokemonCacheProvider>
        <PreviousPokemon onSelect={onSelect} />
        <div className="pokemon-info" style={{ marginLeft: 10 }}>
          <PokemonErrorBoundary
            onReset={() => onSelect('')}
            resetKeys={[pokemonName]}
          >
            <PokemonInfo pokemonName={pokemonName} />
          </PokemonErrorBoundary>
        </div>
      </PokemonCacheProvider>
    </div>
  )
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName: string) {
    setPokemonName(newPokemonName)
  }

  function handleSelect(newPokemonName: string) {
    setPokemonName(newPokemonName)
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <PokemonSection onSelect={handleSelect} pokemonName={pokemonName} />
    </div>
  )
}

export default App
