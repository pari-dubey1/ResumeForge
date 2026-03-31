const { useState, useRef, useCallback } = React;

// ── ICONS ──
const CONTACT_ICONS = {
  '📅': 'Date', '📞': 'Phone', '✉️': 'Email', '🔗': 'URL',
  '📍': 'Location', '💼': 'LinkedIn', '🐙': 'GitHub', '🐦': 'Twitter',
  '🌐': 'Website', '📱': 'Mobile',
};

// ── DEFAULT DATA ──
const defaultData = {
  name: 'Your Name',
  position: 'Frontend Developer',
  avatarUrl: '',
  avatarSize: 76,
  contacts: [
    [{ icon:'📅', text:'1999/01', link:'' }, { icon:'📞', text:'555-000-1234', link:'' }],
    [{ icon:'🐙', text:'github.com', link:'https://github.com' }, { icon:'✉️', text:'you@email.com', link:'mailto:you@email.com' }],
  ],
  sections: [
    {
      id: 's1', type: 'skills', title: 'Professional Skills',
      lines: [
        { text: 'Proficient in ', tags: ['JavaScript','TypeScript'] },
        { text: 'Experienced with ', tags: ['Vue','React'], suffix: ' frontend development and understanding of core principles;' },
        { text: 'Skilled in using ', tags: ['Vite','Webpack'], suffix: ' and other build tools;' },
        { text: 'Proficient in backend development with ', tags: ['NodeJS','MySQL','Redis'] },
      ]
    },
    {
      id: 's2', type: 'experience', title: 'Work Experience',
      entries: [
        {
          company: 'XX Company', startDate: '2020/07', endDate: '2024/07',
          role: 'XX Project – Web Frontend Development',
          bullets: [
            'Responsible for the full development process from requirement analysis to frontend architecture design, feature development, and performance optimization.',
            'Consistently collaborated with product, design, and backend teams to promote agile development processes and implement CI/CD toolchains, ensuring high-quality delivery.',
            'Successfully optimized the payment process page through in-depth research on user experience and frontend performance, improving user conversion and payment success rates.',
          ]
        }
      ]
    },
    {
      id: 's3', type: 'education', title: 'Education',
      entries: [
        { school: 'XX University – Software Engineering', startDate: '2016/07', endDate: '2020/07', desc: '' }
      ]
    }
  ]
};

// ── UNIQUE ID ──
let uid = 0;
const newId = () => `id_${++uid}_${Math.random().toString(36).slice(2)}`;

// ── MAIN APP ──
function App() {
  const [data, setData] = useState(defaultData);
  const [openSections, setOpenSections] = useState({ basicInfo: true });
  const [zoom, setZoom] = useState(0.78);
  const [activeSection, setActiveSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggedSection, setDraggedSection] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);

  const update = useCallback((patch) => setData(d => ({ ...d, ...patch })), []);

  const toggleOpen = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const addSection = (type) => {
    const base = { id: newId(), type };
    if (type === 'skills') base.title = 'Skills';
    if (type === 'skills') base.lines = [];
    if (type === 'experience') { base.title = 'Experience'; base.entries = []; }
    if (type === 'education') { base.title = 'Education'; base.entries = []; }
    if (type === 'text') { base.title = 'About Me'; base.content = 'Write something here...'; }
    setData(d => ({ ...d, sections: [...d.sections, base] }));
  };

  const removeSection = (id) => {
    setData(d => ({ ...d, sections: d.sections.filter(s => s.id !== id) }));
  };

  const updateSection = (id, patch) => {
    setData(d => ({
      ...d,
      sections: d.sections.map(s => s.id === id ? { ...s, ...patch } : s)
    }));
  };

  // Drag and drop functionality
  const handleDragStart = (e, sectionId) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, sectionId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(sectionId);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleDrop = (e, targetSectionId) => {
    e.preventDefault();
    const draggedId = draggedSection;
    const targetId = targetSectionId;

    if (draggedId === targetId) return;

    setData(d => {
      const sections = [...d.sections];
      const draggedIndex = sections.findIndex(s => s.id === draggedId);
      const targetIndex = sections.findIndex(s => s.id === targetId);

      const [draggedItem] = sections.splice(draggedIndex, 1);
      sections.splice(targetIndex, 0, draggedItem);

      return { ...d, sections };
    });

    setDraggedSection(null);
    setDragOverSection(null);
  };

  // Contact management
  const addContactRow = () => {
    setData(d => ({ ...d, contacts: [...d.contacts, []] }));
  };
  const addContactItem = (rowIdx) => {
    const item = { icon: '📞', text: '', link: '' };
    setData(d => {
      const contacts = d.contacts.map((row, i) => i === rowIdx ? [...row, item] : row);
      return { ...d, contacts };
    });
  };
  const updateContactItem = (rowIdx, colIdx, patch) => {
    setData(d => {
      const contacts = d.contacts.map((row, i) =>
        i === rowIdx ? row.map((item, j) => j === colIdx ? { ...item, ...patch } : item) : row
      );
      return { ...d, contacts };
    });
  };
  const removeContactItem = (rowIdx, colIdx) => {
    setData(d => {
      const contacts = d.contacts.map((row, i) =>
        i === rowIdx ? row.filter((_, j) => j !== colIdx) : row
      );
      return { ...d, contacts };
    });
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'resume-config.json'; a.click();
  };
  const importConfig = () => {
    const inp = document.createElement('input'); inp.type='file'; inp.accept='.json';
    inp.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = ev => { try { setData(JSON.parse(ev.target.result)); } catch {} };
      reader.readAsText(file);
    };
    inp.click();
  };

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <div className="topbar-brand">
          Resume<span className="dot">Forge</span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={importConfig}>Import</button>
          <button className="btn btn-ghost" onClick={exportConfig}>Export</button>
          <button className="btn btn-ghost" onClick={() => setData(defaultData)}>Reset</button>
          <button className="btn btn-rust" onClick={() => window.print()}>⎙ Print / PDF</button>
        </div>
      </div>

      <div className="workspace">
        {/* SIDEBAR */}
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Add blocks bar */}
          <div className="add-blocks-bar">
            <button className="add-block-btn" onClick={() => addSection('experience')}>＋ Experience</button>
            <button className="add-block-btn" onClick={() => addSection('skills')}>＋ Skills</button>
            <button className="add-block-btn" onClick={() => addSection('education')}>＋ Education</button>
            <button className="add-block-btn" onClick={() => addSection('text')}>＋ Text</button>
          </div>

          {/* Basic Info */}
          <div className="sidebar-section">
            <div className="sidebar-section-header" onClick={() => toggleOpen('basicInfo')}>
              <div className="sidebar-section-title">
                <span className="icon">👤</span> Basic Info
              </div>
              <span className={`chevron ${openSections.basicInfo ? 'open' : ''}`}>▶</span>
            </div>
            {openSections.basicInfo && (
              <div className="sidebar-section-body">
                <div className="field">
                  <label>Avatar URL</label>
                  <input value={data.avatarUrl} onChange={e => update({ avatarUrl: e.target.value })} placeholder="https://example.com/avatar.jpg" />
                  {data.avatarUrl && <div className="avatar-preview-row">
                    <img src={data.avatarUrl} className="avatar-thumb" alt="avatar" onError={e => e.target.style.display='none'} />
                  </div>}
                </div>
                <div className="field">
                  <label>Avatar Size (px)</label>
                  <input type="range" min="40" max="120" value={data.avatarSize}
                    onChange={e => update({ avatarSize: +e.target.value })} />
                  <span style={{fontSize:'.72rem',color:'var(--slate)'}}>{data.avatarSize}px</span>
                </div>
                <div className="field">
                  <label>Name</label>
                  <input value={data.name} onChange={e => update({ name: e.target.value })} placeholder="Your Name" />
                </div>
                <div className="field">
                  <label>Position / Title</label>
                  <input value={data.position} onChange={e => update({ position: e.target.value })} placeholder="Frontend Developer" />
                </div>

                {/* Contacts */}
                <div style={{marginTop:'12px'}}>
                  <label style={{fontSize:'.7rem',fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--slate)',marginBottom:'8px',display:'block'}}>Contact Rows</label>
                  {data.contacts.map((row, rowIdx) => (
                    <div key={rowIdx} style={{marginBottom:'10px'}}>
                      <div style={{fontSize:'.65rem',color:'#999',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'.05em'}}>Row {rowIdx + 1}</div>
                      {row.map((item, colIdx) => (
                        <div key={colIdx} className="contact-row">
                          <select className="contact-icon-sel" value={item.icon}
                            onChange={e => updateContactItem(rowIdx, colIdx, { icon: e.target.value })}>
                            {Object.entries(CONTACT_ICONS).map(([k,v]) => <option key={k} value={k}>{k} {v}</option>)}
                          </select>
                          <input value={item.text} onChange={e => updateContactItem(rowIdx, colIdx, { text: e.target.value })} placeholder="Text" style={{fontSize:'.75rem',padding:'5px 8px'}} />
                          <input value={item.link} onChange={e => updateContactItem(rowIdx, colIdx, { link: e.target.value })} placeholder="Link" style={{fontSize:'.75rem',padding:'5px 8px',width:'80px'}} />
                          <button className="contact-icon-btn" onClick={() => removeContactItem(rowIdx, colIdx)}>✕</button>
                        </div>
                      ))}
                      <button className="btn-add-entry" style={{marginTop:'4px',padding:'5px'}} onClick={() => addContactItem(rowIdx)}>+ Add Item</button>
                    </div>
                  ))}
                  <button className="btn-add-entry" onClick={addContactRow}>+ Add Contact Row</button>
                </div>
              </div>
            )}
          </div>

          {/* Section editors */}
          {data.sections.map((sec, idx) => (
            <SectionEditor key={sec.id} section={sec} idx={idx}
              isOpen={openSections[sec.id]}
              onToggle={() => toggleOpen(sec.id)}
              onUpdate={(patch) => updateSection(sec.id, patch)}
              onRemove={() => removeSection(sec.id)}
              isDragging={draggedSection === sec.id}
              isDragOver={dragOverSection === sec.id}
              onDragStart={(e) => handleDragStart(e, sec.id)}
              onDragOver={(e) => handleDragOver(e, sec.id)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, sec.id)}
            />
          ))}
        </div>

        {/* SIDEBAR OVERLAY */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>

        {/* PREVIEW */}
        <div className="preview-wrap" onClick={() => setSidebarOpen(false)}>
          <div className="resume-paper" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center'}}>
            <ResumePaper data={data} setData={setData} />
          </div>
        </div>
      </div>

      {/* ZOOM */}
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={() => setZoom(z => Math.min(z+.07, 1.4))}>＋</button>
        <div className="zoom-label">{Math.round(zoom*100)}%</div>
        <button className="zoom-btn" onClick={() => setZoom(z => Math.max(z-.07, .3))}>－</button>
      </div>
    </>
  );
}

// ── SECTION EDITOR ──
function SectionEditor({ section, isOpen, onToggle, onUpdate, onRemove, isDragging, isDragOver, onDragStart, onDragOver, onDragEnd, onDrop }) {
  const icons = { skills:'🛠', experience:'💼', education:'🎓', text:'📝' };
  const icon = icons[section.type] || '📄';

  const handleClick = (e) => {
    if (!isDragging) {
      onToggle();
    }
  };

  const addSkillLine = () => {
    onUpdate({ lines: [...(section.lines||[]), { text:'', tags:[], suffix:'' }] });
  };
  const updateSkillLine = (i, patch) => {
    const lines = section.lines.map((l,j) => j===i ? {...l,...patch} : l);
    onUpdate({ lines });
  };
  const removeSkillLine = (i) => {
    onUpdate({ lines: section.lines.filter((_,j) => j!==i) });
  };

  const addEntry = () => {
    const blank = section.type === 'experience'
      ? { id:newId(), company:'', startDate:'', endDate:'', role:'', bullets:[''] }
      : { id:newId(), school:'', startDate:'', endDate:'', desc:'' };
    onUpdate({ entries: [...(section.entries||[]), blank] });
  };
  const updateEntry = (id, patch) => {
    onUpdate({ entries: section.entries.map(e => e.id===id ? {...e,...patch} : e) });
  };
  const removeEntry = (id) => {
    onUpdate({ entries: section.entries.filter(e => e.id!==id) });
  };

  return (
    <div className={`sidebar-section ${isDragOver ? 'drag-over' : ''}`}>
      <div className={`sidebar-section-header ${isDragging ? 'dragging' : ''}`}
           draggable
           onDragStart={onDragStart}
           onDragOver={onDragOver}
           onDragEnd={onDragEnd}
           onDrop={onDrop}
           onClick={handleClick}>
        <div className="sidebar-section-title">
          <span className="icon">{icon}</span> {section.title || section.type}
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <button style={{background:'none',border:'none',cursor:'pointer',fontSize:'.7rem',color:'var(--rust)',padding:'2px 6px'}} onClick={e=>{e.stopPropagation();onRemove();}}>✕</button>
          <span className={`chevron ${isOpen?'open':''}`}>▶</span>
        </div>
      </div>
      {isOpen && (
        <div className="sidebar-section-body">
          <div className="field">
            <label>Section Title</label>
            <input value={section.title||''} onChange={e=>onUpdate({title:e.target.value})} />
          </div>

          {section.type === 'skills' && (
            <>
              {(section.lines||[]).map((line, i) => (
                <div key={i} className="entry-card">
                  <div className="entry-card-header">
                    <span className="entry-card-title">Line {i+1}</span>
                    <button className="entry-card-del" onClick={()=>removeSkillLine(i)}>✕</button>
                  </div>
                  <div className="field">
                    <label>Prefix Text</label>
                    <input value={line.text} onChange={e=>updateSkillLine(i,{text:e.target.value})} placeholder="Proficient in " />
                  </div>
                  <div className="field">
                    <label>Keywords (comma-separated)</label>
                    <input value={(line.tags||[]).join(', ')} onChange={e=>updateSkillLine(i,{tags:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)})} placeholder="React, Vue, TypeScript" />
                  </div>
                  <div className="field">
                    <label>Suffix Text</label>
                    <input value={line.suffix||''} onChange={e=>updateSkillLine(i,{suffix:e.target.value})} placeholder="; (optional)" />
                  </div>
                </div>
              ))}
              <button className="btn-add-entry" onClick={addSkillLine}>+ Add Skill Line</button>
            </>
          )}

          {section.type === 'experience' && (
            <>
              {(section.entries||[]).map(entry => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-card-header">
                    <span className="entry-card-title">{entry.company||'Company'}</span>
                    <button className="entry-card-del" onClick={()=>removeEntry(entry.id)}>✕</button>
                  </div>
                  <div className="field"><label>Company</label>
                    <input value={entry.company} onChange={e=>updateEntry(entry.id,{company:e.target.value})} /></div>
                  <div className="field-row">
                    <div className="field"><label>Start</label>
                      <input value={entry.startDate} onChange={e=>updateEntry(entry.id,{startDate:e.target.value})} placeholder="2020/01" /></div>
                    <div className="field"><label>End</label>
                      <input value={entry.endDate} onChange={e=>updateEntry(entry.id,{endDate:e.target.value})} placeholder="2024/01 or Present" /></div>
                  </div>
                  <div className="field"><label>Role / Project</label>
                    <input value={entry.role} onChange={e=>updateEntry(entry.id,{role:e.target.value})} /></div>
                  <div className="field">
                    <label>Bullets (one per line)</label>
                    <textarea value={(entry.bullets||[]).join('\n')}
                      onChange={e=>updateEntry(entry.id,{bullets:e.target.value.split('\n')})}
                      rows={4} />
                  </div>
                </div>
              ))}
              <button className="btn-add-entry" onClick={addEntry}>+ Add Entry</button>
            </>
          )}

          {section.type === 'education' && (
            <>
              {(section.entries||[]).map(entry => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-card-header">
                    <span className="entry-card-title">{entry.school||'School'}</span>
                    <button className="entry-card-del" onClick={()=>removeEntry(entry.id)}>✕</button>
                  </div>
                  <div className="field"><label>School / Degree</label>
                    <input value={entry.school} onChange={e=>updateEntry(entry.id,{school:e.target.value})} /></div>
                  <div className="field-row">
                    <div className="field"><label>Start</label>
                      <input value={entry.startDate} onChange={e=>updateEntry(entry.id,{startDate:e.target.value})} /></div>
                    <div className="field"><label>End</label>
                      <input value={entry.endDate} onChange={e=>updateEntry(entry.id,{endDate:e.target.value})} /></div>
                  </div>
                  <div className="field"><label>Description</label>
                    <input value={entry.desc||''} onChange={e=>updateEntry(entry.id,{desc:e.target.value})} placeholder="GPA, honors, etc." /></div>
                </div>
              ))}
              <button className="btn-add-entry" onClick={addEntry}>+ Add Entry</button>
            </>
          )}

          {section.type === 'text' && (
            <div className="field">
              <label>Content</label>
              <textarea value={section.content||''} onChange={e=>onUpdate({content:e.target.value})} rows={5} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── RESUME PAPER ──
function ResumePaper({ data }) {
  return (
    <>
      {/* HEADER */}
      <div className="r-header">
        <div className="r-avatar" style={{ width: data.avatarSize, height: data.avatarSize }}>
          {data.avatarUrl
            ? <img src={data.avatarUrl} alt="avatar" onError={e => e.target.style.display='none'} />
            : <span>👤</span>
          }
        </div>
        <div className="r-name-block">
          <div className="r-name">{data.name || 'Your Name'} <span className="r-position">{data.position}</span></div>
          <div className="r-contacts">
            {data.contacts.flatMap((row, ri) =>
              row.map((item, ci) => (
                <div key={`${ri}-${ci}`} className="r-contact-item">
                  <span className="ci-icon">{item.icon}</span>
                  {item.link
                    ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.text}</a>
                    : <span>{item.text}</span>
                  }
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECTIONS */}
      {data.sections.map(sec => (
        <ResumeSection key={sec.id} section={sec} />
      ))}
    </>
  );
}

function ResumeSection({ section }) {
  return (
    <div className="r-section">
      <div className="r-section-title">{section.title}</div>

      {section.type === 'skills' && (
        <div className="r-skills-list">
          {(section.lines||[]).map((line, i) => (
            <div key={i} className="r-skill-line">
              {line.text}
              {(line.tags||[]).map((tag, j) => (
                <span key={j}><span className="r-skill-kw">{tag}</span>{j < line.tags.length-1 ? <span style={{color:'#9ca3af'}}> , </span> : null}</span>
              ))}
              {line.suffix && <span>{line.suffix}</span>}
            </div>
          ))}
        </div>
      )}

      {section.type === 'experience' && (
        <div>
          {(section.entries||[]).map(e => (
            <div key={e.id} className="r-exp-item">
              <div className="r-exp-header">
                <div className="r-exp-company">{e.company}</div>
                <div className="r-exp-date">{e.startDate} – {e.endDate}</div>
              </div>
              <div className="r-exp-role">{e.role}</div>
              <ul className="r-exp-bullets">
                {(e.bullets||[]).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {section.type === 'education' && (
        <div>
          {(section.entries||[]).map(e => (
            <div key={e.id} className="r-edu-item">
              <div className="r-edu-header">
                <div className="r-edu-school">{e.school}</div>
                <div className="r-edu-date">{e.startDate} – {e.endDate}</div>
              </div>
              {e.desc && <div className="r-edu-desc">{e.desc}</div>}
            </div>
          ))}
        </div>
      )}

      {section.type === 'text' && (
        <div className="r-text-block">{section.content}</div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);