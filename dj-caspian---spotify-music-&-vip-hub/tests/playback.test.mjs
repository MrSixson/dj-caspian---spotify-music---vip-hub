import test from 'node:test';
import assert from 'node:assert/strict';
import { addRecentTrack, addTrackToQueue, pickNextTrack } from '../src/utils/playback.mjs';

const a = { id: 'a' };
const b = { id: 'b' };
const c = { id: 'c' };

test('queued tracks take priority and exactly one item is consumed', () => {
  const result = pickNextTrack({
    tracks: [a, b, c],
    currentTrackId: 'a',
    queue: [c, b],
    isShuffle: true,
    random: () => 0,
  });
  assert.equal(result.track, c);
  assert.deepEqual(result.remainingQueue, [b]);
  assert.equal(result.fromQueue, true);
});

test('shuffle never immediately selects the current track', () => {
  const result = pickNextTrack({
    tracks: [a, b, c],
    currentTrackId: 'a',
    queue: [],
    isShuffle: true,
    random: () => 0,
  });
  assert.equal(result.track, b);
});

test('normal playback advances and wraps to the first track', () => {
  assert.equal(pickNextTrack({ tracks: [a, b, c], currentTrackId: 'b', queue: [], isShuffle: false }).track, c);
  assert.equal(pickNextTrack({ tracks: [a, b, c], currentTrackId: 'c', queue: [], isShuffle: false }).track, a);
});

test('an unknown current track safely starts from the first catalog item', () => {
  assert.equal(pickNextTrack({ tracks: [a, b], currentTrackId: 'missing', queue: [], isShuffle: false }).track, a);
});

test('empty catalog returns no next track', () => {
  assert.equal(pickNextTrack({ tracks: [], currentTrackId: null, queue: [], isShuffle: false }).track, null);
});

test('adding a duplicate queue item moves it to the end instead of duplicating it', () => {
  assert.deepEqual(addTrackToQueue([a, b], a), [b, a]);
});

test('recently played moves the latest track to the front and enforces its limit', () => {
  assert.deepEqual(addRecentTrack(['a', 'b', 'c'], 'b'), ['b', 'a', 'c']);
  assert.deepEqual(addRecentTrack(['a', 'b', 'c'], 'd', 3), ['d', 'a', 'b']);
});
