import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCliArgs } from '../src/args.js';

test('по умолчанию 10 запросов', () => {
  assert.deepEqual(parseCliArgs(['https://example.com/a.jpg']), {
    url: 'https://example.com/a.jpg',
    count: 10,
  });
});

test('принимает --count', () => {
  assert.equal(parseCliArgs(['https://example.com', '--count', '3']).count, 3);
});

test('ошибка без адреса', () => {
  assert.throws(() => parseCliArgs([]), /Не указан адрес/);
});

test('ошибка на кривом адресе и чужом протоколе', () => {
  assert.throws(() => parseCliArgs(['not a url']), /Некорректный адрес/);
  assert.throws(() => parseCliArgs(['ftp://example.com/file']), /только http/);
});

test('ошибка на плохом --count', () => {
  assert.throws(() => parseCliArgs(['https://example.com', '--count', '0']), /--count/);
  assert.throws(() => parseCliArgs(['https://example.com', '--count', 'abc']), /--count/);
});
