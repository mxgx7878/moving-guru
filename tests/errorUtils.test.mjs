import test from 'node:test';
import assert from 'node:assert/strict';

import { getErrorMessage } from '../src/utils/errorUtils.js';

test('shows field validation details instead of a generic API message', () => {
  const error = {
    response: {
      data: {
        message: 'Validation failed',
        errors: { password: ['The password field must be at least 12 characters.'] },
      },
    },
  };

  assert.equal(getErrorMessage(error), 'The password field must be at least 12 characters.');
});

test('keeps specific API errors and transport errors readable', () => {
  assert.equal(getErrorMessage({ response: { data: { message: 'Subscription changed.' } } }), 'Subscription changed.');
  assert.equal(getErrorMessage({ message: 'Network Error' }), 'Network Error');
});

test('includes every validation message when multiple fields fail', () => {
  const error = {
    response: {
      data: {
        message: 'Validation failed',
        errors: { email: ['Email is required.'], password: ['Password is too short.'] },
      },
    },
  };

  assert.equal(getErrorMessage(error), 'Email is required. Password is too short.');
});
