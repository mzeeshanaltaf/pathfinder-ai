'use client';

import { CAREER_PATH_BY_ID, gemId, gemsForPhase, getPhase, TIMELINE_NOTE, type PathId, type PhaseId } from '@/data/roadmap';
import { roadmapSections } from '@/lib/progress';
import { useProgress } from '@/store/progress';
import Logo from './Logo';
import { phaseHeading, toolsTitle } from './roadmapParts';

/** Pipeline / diagram steps as one line ("A → B | C → D"; parallel boxes keep their " | "). */
const flowText = (steps: string[]) => steps.join(' → ');

/**
 * Printable roadmap: plain ink on white, every section expanded, ✓ for progress. Rendered into
 * #print-root (hidden on screen) and shown by the `@media print` rules in globals.css.
 */
export default function RoadmapPrint({ path }: { path: PathId }) {
  const p = CAREER_PATH_BY_ID[path];
  const sections = roadmapSections(path);
  const gems = useProgress((s) => s.gems);
  const ids = sections.flatMap((s) => s.ids);
  const found = ids.reduce((n, id) => n + gemsForPhase(id).filter((g) => gems[g]).length, 0);
  const total = ids.reduce((n, id) => n + gemsForPhase(id).length, 0);

  return (
    <article className="print-doc">
      <header className="print-head">
        <Logo size={56} />
        <div>
          <h1>Pathfinder AI · {p.label} roadmap</h1>
          <p>
            Find your path into AI. · {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} · {found}/{total} Skill Gems collected
          </p>
        </div>
      </header>

      <section className="print-intro">
        <p>
          <b>Goal:</b> {p.goal}
        </p>
        <p>{p.definition}</p>
        <p>
          <b>Timeline:</b> {p.timeline.total}
        </p>
        <ol>
          {p.timeline.steps.map((s) => (
            <li key={s.when}>
              <b>{s.when}:</b> {s.what}
            </li>
          ))}
        </ol>
        {p.timeline.note && <p>{p.timeline.note}</p>}
        <p className="print-note">{TIMELINE_NOTE}</p>
      </section>

      {sections.map((sec) => (
        <section key={sec.title} className="print-section">
          <h2>{sec.title}</h2>
          {sec.ids.map((id) => (
            <PrintPhase key={id} id={id} />
          ))}
        </section>
      ))}
    </article>
  );
}

function PrintPhase({ id }: { id: PhaseId }) {
  const phase = getPhase(id);
  const { kicker, title, subtitle } = phaseHeading(id);
  const gems = useProgress((s) => s.gems);
  const badge = useProgress((s) => s.badges[id]);
  const built = useProgress((s) => (phase.project ? !!s.projects[phase.project.id] : false));
  const ids = gemsForPhase(id);
  const found = ids.filter((g) => gems[g]).length;

  return (
    <div className="print-phase" data-phase={id}>
      <div className="print-phase-head">
        <div className="print-kicker">{kicker}</div>
        <h3>
          {title}: {subtitle}
        </h3>
        <div className="print-meta">
          {found}/{ids.length} topics ✓ · Badge: {badge ? '★'.repeat(badge.stars) + '☆'.repeat(3 - badge.stars) : 'not earned yet'}
        </div>
      </div>
      <p>{phase.summary}</p>
      {phase.groups.map((g) => (
        <div key={g.title} className="print-group">
          <h4>{g.title}</h4>
          <ul>
            {g.topics.map((t) => (
              <li key={t.id}>
                <span className="print-check">{gems[gemId(id, t.id)] ? '☑' : '☐'}</span> <b>{t.label}</b>: {t.bite}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {phase.tools && (
        <p>
          <b>{toolsTitle(phase)}:</b> {phase.tools.join(', ')}
        </p>
      )}
      {phase.keyQuestion && (
        <p>
          <b>Key question:</b> “{phase.keyQuestion}”
        </p>
      )}
      {phase.antiPatterns && (
        <div className="print-group">
          <h4>What doesn&apos;t work</h4>
          <ul>
            {phase.antiPatterns.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
      {phase.diagrams?.map((d) => (
        <p key={d.title}>
          <b>{d.title}:</b> {flowText(d.steps)}
        </p>
      ))}
      {phase.project && (
        <p>
          <span className="print-check">{built ? '☑' : '☐'}</span> <b>Project: {phase.project.title}</b> ({built ? 'built' : 'not built yet'}): {flowText(phase.project.pipeline)}
        </p>
      )}
    </div>
  );
}
