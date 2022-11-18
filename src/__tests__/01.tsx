import { alfredTip } from '@kentcdodds/react-workshop-app/test-utils'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import App from '../final/01'
// import App from '../exercise/01'

function expectIsNotNull<T,>(value: T | null): asserts value is T {
  expect(value).not.toBeNull()
}

test('clicking the button increments the count with useReducer', () => {
  jest.spyOn(React, 'useReducer')

  const { container } = render(<App />)

  const button = container.querySelector('button')
  expectIsNotNull(button)

  userEvent.click(button)
  expect(button).toHaveTextContent('1')
  userEvent.click(button)
  expect(button).toHaveTextContent('2')

  alfredTip(() => {
    expect(React.useReducer).toHaveBeenCalled()
  }, 'The Counter component that is rendered must call "useReducer" to get the "state" and "dispatch" function and you should get rid of that useState call.')
})
