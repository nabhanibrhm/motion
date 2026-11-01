import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EPISODE_IDS, buildMigrationPlan, migrateEpisodes } from '../scripts/migrate-episodes.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'motion-migration-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const id of EPISODE_IDS) {
    const directory = path.join(root, 'out/Ekonomi_keuangan', id);
    for (const folder of ['voiceover', 'compositions', 'public/fonts']) fs.mkdirSync(path.join(directory, folder), { recursive: true });
    fs.writeFileSync(path.join(directory, 'voiceover', `${id}.json`), `\uFEFF${JSON.stringify({ source: 'supertonic', sections: [{ id: 'hook', lines: [{ text: 'Existing words.' }] }] })}\r\n`);
    fs.writeFileSync(path.join(directory, 'script-short.md'), `# Existing ${id} (Short)\r\n\r\nSources unchanged.\r\n`);
    fs.writeFileSync(path.join(directory, 'compositions/hook.html'), '<template><audio data-start="1.2345" src="public/sfx/pop.wav"></audio></template>\r\n');
    fs.writeFileSync(path.join(directory, 'compositions/captions.html'), 'GENERATED: exclude');
    fs.writeFileSync(path.join(directory, 'public/fonts/OFL.txt'), 'Original font license\r\n');
  }
  return root;
}

test('migration is byte faithful, shares identical assets and reruns without writes', (t) => {
  const root = fixture(t);
  const dry = migrateEpisodes({ root, dryRun: true });
  assert.equal(dry.episodes, 7);
  assert.equal(dry.scenes, 7);
  assert.equal(dry.sharedAssets, 1);
  assert.equal(fs.existsSync(path.join(root, 'episodes')), false);
  const first = migrateEpisodes({ root });
  assert.equal(first.created, first.files);
  const before = fs.statSync(path.join(root, 'episodes/inflasi/narration.json')).mtimeMs;
  const repeat = migrateEpisodes({ root });
  assert.equal(repeat.created, 0);
  assert.equal(repeat.pending, 0);
  assert.equal(fs.statSync(path.join(root, 'episodes/inflasi/narration.json')).mtimeMs, before);
  for (const id of EPISODE_IDS) {
    const original = path.join(root, 'out/Ekonomi_keuangan', id);
    assert.deepEqual(fs.readFileSync(path.join(root, 'episodes', id, 'narration.json')), fs.readFileSync(path.join(original, 'voiceover', `${id}.json`)));
    assert.deepEqual(fs.readFileSync(path.join(root, 'episodes', id, 'scenes/hook.html')), fs.readFileSync(path.join(original, 'compositions/hook.html')));
    assert.deepEqual(fs.readFileSync(path.join(root, 'episodes', id, 'script-short.md')), fs.readFileSync(path.join(original, 'script-short.md')));
    assert.equal(fs.existsSync(path.join(root, 'episodes', id, 'scenes/captions.html')), false);
  }
  const inflasi = JSON.parse(fs.readFileSync(path.join(root, 'episodes/inflasi/episode.json')));
  const kelas = JSON.parse(fs.readFileSync(path.join(root, 'episodes/kelas/episode.json')));
  assert.equal(inflasi.runtime.profile, 'legacy-inflasi');
  assert.equal(inflasi.audio.bed, null);
  assert.equal(kelas.runtime.profile, 'modern');
  assert.equal(kelas.audio.bed, 'music/bed.mp3');
  assert.equal(kelas.number, 7);
  assert.equal(migrateEpisodes({ root, verify: true }).pending, 0);
});

test('changed authored target stops the entire preflight before any writes', (t) => {
  const root = fixture(t);
  const directory = path.join(root, 'episodes/kelas/scenes');
  fs.mkdirSync(directory, { recursive: true });
  const edited = path.join(directory, 'hook.html');
  fs.writeFileSync(edited, 'User authored edits');
  assert.throws(() => migrateEpisodes({ root }), /Refusing to overwrite changed target/);
  assert.equal(fs.readFileSync(edited, 'utf8'), 'User authored edits');
  assert.equal(fs.existsSync(path.join(root, 'episodes/inflasi')), false);
  assert.equal(fs.existsSync(path.join(root, 'assets')), false);
});

test('asset collision fails without creating episode files', (t) => {
  const root = fixture(t);
  fs.writeFileSync(path.join(root, 'out/Ekonomi_keuangan/kelas/public/fonts/OFL.txt'), 'Different bytes');
  assert.throws(() => migrateEpisodes({ root }), /Shared asset collision/);
  assert.equal(fs.existsSync(path.join(root, 'episodes')), false);
});

test('baseline guards old authored inputs and verify refuses incomplete output', (t) => {
  const root = fixture(t);
  assert.throws(() => migrateEpisodes({ root, verify: true }), /Migration incomplete/);
  assert.equal(fs.existsSync(path.join(root, 'episodes')), false);
  fs.mkdirSync(path.join(root, '.cache/migration-baseline'), { recursive: true });
  fs.writeFileSync(path.join(root, '.cache/migration-baseline/source-hashes.json'), '[]');
  assert.throws(() => buildMigrationPlan(root), /Legacy source differs from migration baseline/);
});

test('retired legacy source verifies copies with a recorded archive and requires restore to remigrate', (t) => {
  const root = fixture(t);
  const archiveDirectory = path.join(root, '.cache/migration-baseline');
  fs.mkdirSync(archiveDirectory, { recursive: true });
  // A synthetic archive identity tests hash verification; no real project files are used.
  fs.writeFileSync(path.join(archiveDirectory, 'legacy-source.zip'), Buffer.from([0x50, 0x4b, 1, 2, 3]));
  migrateEpisodes({ root });
  fs.rmSync(path.join(root, 'out'), { recursive: true });
  const result = migrateEpisodes({ root, verify: true });
  assert.equal(result.status, 'verified');
  assert.equal(result.liveSources, 0);
  assert.equal(result.retiredSources, 28);
  assert.equal(result.archiveStatus, 'sha256-verified');
  assert.equal(result.migrationRequiresRestore, true);
  assert.throws(() => migrateEpisodes({ root }), /Legacy source unavailable; restore/);
  fs.writeFileSync(path.join(root, 'episodes/kelas/script-short.md'), 'Changed citations');
  assert.throws(() => migrateEpisodes({ root, verify: true }), /Migrated output differs/);
});

test('retirement cannot claim fidelity without recovery archive or with a changed archive', (t) => {
  const root = fixture(t);
  migrateEpisodes({ root });
  fs.rmSync(path.join(root, 'out'), { recursive: true });
  assert.throws(() => migrateEpisodes({ root, verify: true }), /retired without a recorded recovery archive/);
  const second = fixture(t);
  const archiveDirectory = path.join(second, '.cache/migration-baseline');
  fs.mkdirSync(archiveDirectory, { recursive: true });
  fs.writeFileSync(path.join(archiveDirectory, 'legacy-source.zip'), 'synthetic archived content');
  migrateEpisodes({ root: second });
  fs.rmSync(path.join(second, 'out'), { recursive: true });
  fs.writeFileSync(path.join(archiveDirectory, 'legacy-source.zip'), 'corrupt');
  assert.throws(() => migrateEpisodes({ root: second, verify: true }), /Legacy source archive differs/);
});
