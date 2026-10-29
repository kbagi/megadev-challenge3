<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // The reports the desk read as a one-day move, in the reporter's words.
  const rows = uniqueById(reports as Report[]).filter((r) => notes.oneDayMove.includes(r.id));
</script>

<table>
  <thead><tr><th>report</th><th>tenant</th><th>received</th><th>what they wrote</th></tr></thead>
  <tbody>
    {#each rows as r (r.id)}
      <tr>
        <td><code>{r.id}</code></td>
        <td>{r.tenant} <span class="muted">{tenantOf(r)?.locale}</span></td>
        <td class="muted">{r.receivedAt.slice(0, 10)}</td>
        <td>{r.body}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .muted { color: var(--muted); font-size: 0.85em; }
</style>
