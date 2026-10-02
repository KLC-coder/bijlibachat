import { useMemo, useState } from 'react'
import './App.css'
import { appliancePresets } from './data/appliancePresets'
import {
  calculateApplianceDailyKwh,
  calculateMonthlyKwh,
  generateOptimizationPlan,
  getDailyUsageHours,
  isProtectedAppliance,
} from './utils/calculations'

const emptyForm = {
  name: '',
  quantity: '1',
  watts: '',
  usageMode: 'daily',
  hoursPerDay: '6',
  cyclesPerWeek: '3',
  hoursPerCycle: '1',
  dutyCyclePercent: '40',
  essential: false,
}

function describeUsage(item) {
  if (item.usageMode === 'cycles') {
    return `${item.cyclesPerWeek} cycles/week · ${item.hoursPerCycle} hr/cycle`
  }

  if (item.usageMode === 'duty-cycle') {
    return `${item.dutyCyclePercent}% active · ${getDailyUsageHours(item).toFixed(1)} hr/day`
  }

  return `${item.hoursPerDay} hr/day`
}

function formatRupees(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)
}

function App() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [targetUnits, setTargetUnits] = useState('50')
  const [tariffRate, setTariffRate] = useState('8')
  const [plan, setPlan] = useState(null)

  const applianceRows = useMemo(
    () =>
      items.map((item) => {
        const dailyKwh = calculateApplianceDailyKwh(item)

        return {
          ...item,
          dailyKwh,
          monthlyKwh: calculateMonthlyKwh(dailyKwh),
          averageDailyHours: getDailyUsageHours(item),
        }
      }),
    [items],
  )

  const totals = useMemo(() => {
    const dailyTotal = applianceRows.reduce((total, item) => total + item.dailyKwh, 0)
    const monthlyTotal = applianceRows.reduce((total, item) => total + item.monthlyKwh, 0)

    return {
      dailyTotal,
      monthlyTotal,
      protectedItems: applianceRows.filter((item) => item.essential || isProtectedAppliance(item.name)),
      adjustableItems: applianceRows.filter(
        (item) => !item.essential && !isProtectedAppliance(item.name),
      ),
    }
  }, [applianceRows])

  const usageRows = [...applianceRows]
    .sort((first, second) => second.monthlyKwh - first.monthlyKwh)
    .slice(0, 5)
  const highestMonthlyKwh = usageRows[0]?.monthlyKwh || 1

  const addPreset = (preset) => {
    const newItem = {
      id: `${preset.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...preset,
      quantity: 1,
    }

    setItems((current) => [...current, newItem])
    setPlan(null)
  }

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleAddCustom = (event) => {
    event.preventDefault()

    const quantity = Number(form.quantity)
    const watts = Number(form.watts)
    const usageMode = form.usageMode
    const hoursPerDay = Number(form.hoursPerDay)
    const cyclesPerWeek = Number(form.cyclesPerWeek)
    const hoursPerCycle = Number(form.hoursPerCycle)
    const dutyCyclePercent = Number(form.dutyCyclePercent)
    const usageIsValid = usageMode === 'cycles'
      ? Number.isFinite(cyclesPerWeek) && cyclesPerWeek > 0 && Number.isFinite(hoursPerCycle) && hoursPerCycle > 0 && hoursPerCycle <= 24
      : usageMode === 'duty-cycle'
        ? Number.isFinite(dutyCyclePercent) && dutyCyclePercent > 0 && dutyCyclePercent <= 100
        : Number.isFinite(hoursPerDay) && hoursPerDay > 0 && hoursPerDay <= 24

    if (!form.name.trim() || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(watts) || watts <= 0 || !usageIsValid) {
      return
    }

    const nextItem = {
      id: `${form.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: form.name.trim(),
      quantity,
      watts,
      usageMode,
      hoursPerDay,
      cyclesPerWeek,
      hoursPerCycle,
      dutyCyclePercent,
      essential: form.essential,
    }

    setItems((current) => [...current, nextItem])
    setForm(emptyForm)
    setPlan(null)
  }

  const handleToggleEssential = (itemId) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, essential: !item.essential } : item,
      ),
    )
    setPlan(null)
  }

  const handleRemoveItem = (itemId) => {
    setItems((current) => current.filter((item) => item.id !== itemId))
    setPlan(null)
  }

  const handleOptimize = () => {
    const nextPlan = generateOptimizationPlan(applianceRows, Number(targetUnits) || 0)
    setPlan(nextPlan)
  }

  const effectiveTariffRate = Math.max(0, Number(tariffRate) || 0)
  const estimatedMonthlyBill = totals.monthlyTotal * effectiveTariffRate

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand-wrap" href="#dashboard" aria-label="BijliBachat dashboard">
          <span className="brand-mark">⚡</span>
          <span className="brand-name">BijliBachat</span>
        </a>
        <span className="sidebar-label">Workspace</span>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#dashboard"><span>⌂</span>Overview</a>
          <a className="nav-link" href="#appliances"><span>▦</span>Appliances</a>
          <a className="nav-link" href="#savings"><span>↗</span>Bill optimizer</a>
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>Local estimate</span>
        </div>
      </aside>

      <main className="dashboard" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">HOME ENERGY DASHBOARD</p>
            <h1>Good energy starts at home.</h1>
            <p className="topbar-copy">Calculate your usage and manage your electricity, one appliance at a time.</p>
          </div>
          <div className="workspace-badge">
            <span className="badge-mark">B</span>
            <span><strong>Home overview</strong><small>Personal workspace</small></span>
          </div>
        </header>

        <section className="overview-grid" aria-label="Energy overview">
          <section className="panel usage-panel">
            <div className="section-heading-row">
              <div><span className="section-kicker">MONTHLY BREAKDOWN</span><h2>Usage by appliance</h2></div>
              <span className="count-badge">{applianceRows.length} tracked</span>
            </div>
            {usageRows.length ? (
              <div className="usage-bars">
                {usageRows.map((item, index) => (
                  <div className="usage-row" key={item.id}>
                    <span className="usage-index">0{index + 1}</span>
                    <span className="usage-name">{item.name}</span>
                    <span className="usage-track"><span style={{ width: `${(item.monthlyKwh / highestMonthlyKwh) * 100}%` }} /></span>
                    <strong>{item.monthlyKwh.toFixed(1)} <small>kWh</small></strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="chart-empty"><span className="empty-mark">＋</span><p>Add an appliance to see your usage breakdown.</p></div>
            )}
          </section>

          <aside className="panel monthly-panel">
            <span className="section-kicker">ESTIMATED THIS MONTH</span>
            <div className="monthly-value">{totals.monthlyTotal.toFixed(1)}<span>kWh</span></div>
            <div className="monthly-divider" />
            <div className="monthly-detail"><span>Daily average</span><strong>{totals.dailyTotal.toFixed(2)} kWh</strong></div>
            <div className="monthly-detail"><span>Estimated energy charge</span><strong>{formatRupees(estimatedMonthlyBill)}</strong></div>
            <div className="monthly-detail"><span>Essentials protected</span><strong>{totals.protectedItems.length} loads</strong></div>
            <label className="rate-control" htmlFor="tariffRate"><span>Electricity rate <small>estimated per unit</small></span><span className="rate-input"><span>₹</span><input id="tariffRate" type="number" min="0" step="0.01" value={tariffRate} onChange={(event) => setTariffRate(event.target.value)} /><span>/kWh</span></span></label>
            <p className="estimate-note">The rate is an estimate. Your bill may include other charges.</p>
            <a href="#appliances" className="text-link">Manage appliances <span>→</span></a>
          </aside>
        </section>

        <section className="panel appliance-panel" id="appliances">
          <div className="section-heading-row">
            <div><span className="section-kicker">BUILD YOUR HOME PROFILE</span><h2>Your appliances</h2></div>
            <span className="count-badge">{applianceRows.length} items</span>
          </div>
          <div className="quick-add-row">
            {appliancePresets.map((preset, index) => (
              <button key={`${preset.name}-${preset.watts}`} type="button" className="chip-button" onClick={() => addPreset(preset)}>
                <span className={`appliance-symbol symbol-${index % 4}`}>{['◉', '⌁', '◌', '✳'][index % 4]}</span>
                <span className="preset-copy"><strong>{preset.name}</strong><small>{preset.watts}W · {describeUsage(preset)}</small></span>
                <span className="add-mark" aria-hidden="true">+</span>
              </button>
            ))}
          </div>

          <details className="custom-details">
            <summary><span className="add-mark">+</span> Add a custom appliance</summary>
            <form className="custom-form" onSubmit={handleAddCustom}>
              <label><span>Appliance name</span><input type="text" name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Heater" required /></label>
              <label><span>Quantity</span><input type="number" name="quantity" min="1" value={form.quantity} onChange={handleFormChange} required /></label>
              <label><span>Power (W)</span><input type="number" name="watts" min="1" value={form.watts} onChange={handleFormChange} placeholder="1500" required /></label>
              <label><span>Usage pattern</span><select name="usageMode" value={form.usageMode} onChange={handleFormChange}><option value="daily">Hours per day</option><option value="cycles">Cycles per week</option><option value="duty-cycle">Duty cycle</option></select></label>
              {form.usageMode === 'cycles' ? (
                <>
                  <label><span>Cycles per week</span><input type="number" name="cyclesPerWeek" min="0.1" max="168" step="0.1" value={form.cyclesPerWeek} onChange={handleFormChange} required /></label>
                  <label><span>Hours per cycle</span><input type="number" name="hoursPerCycle" min="0.1" max="24" step="0.1" value={form.hoursPerCycle} onChange={handleFormChange} required /></label>
                </>
              ) : form.usageMode === 'duty-cycle' ? (
                <label><span>Active time (%)</span><input type="number" name="dutyCyclePercent" min="1" max="100" step="1" value={form.dutyCyclePercent} onChange={handleFormChange} required /></label>
              ) : (
                <label><span>Hours per day</span><input type="number" name="hoursPerDay" min="0.1" max="24" step="0.1" value={form.hoursPerDay} onChange={handleFormChange} required /></label>
              )}
              <label className="checkbox-label"><input type="checkbox" name="essential" checked={form.essential} onChange={handleFormChange} />Protect as essential</label>
              <button type="submit" className="primary-button">Add appliance</button>
            </form>
          </details>
        </section>

        <div className="content-grid">
          <section className="panel list-panel">
            <div className="section-heading-row">
              <div><span className="section-kicker">LIVE CALCULATION</span><h2>Appliance list</h2></div>
              <span className="count-badge">{applianceRows.length} items</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Appliance</th><th>Qty</th><th>Power</th><th>Usage</th><th>Daily</th><th>Monthly</th><th>Priority</th><th>Action</th></tr></thead>
                <tbody>
                  {applianceRows.length === 0 ? (
                    <tr><td colSpan="8" className="empty-state">No appliances added yet. Choose one above to get started.</td></tr>
                  ) : applianceRows.map((item) => (
                    <tr key={item.id}>
                      <td className="table-appliance">{item.name}</td><td>{item.quantity}</td><td>{item.watts}W</td><td>{describeUsage(item)}</td><td>{item.dailyKwh.toFixed(2)} kWh</td><td>{item.monthlyKwh.toFixed(1)} kWh</td>
                      <td><button type="button" className={`priority-toggle ${item.essential ? 'essential' : ''}`} onClick={() => handleToggleEssential(item.id)}>{item.essential ? 'Essential' : 'Adjustable'}</button></td>
                      <td><button type="button" className="delete-button" onClick={() => handleRemoveItem(item.id)} aria-label={`Delete ${item.name}`}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="panel side-panel" id="savings">
            <div className="section-heading-row"><div><span className="section-kicker">PERSONALIZED PLAN</span><h2>Reduce your bill</h2></div></div>
            <p className="optimizer-copy">Set a monthly saving goal. Your essentials stay protected.</p>
            <div className="target-box">
              <label htmlFor="targetUnits">Target monthly saving</label>
              <div className="target-row"><input id="targetUnits" type="number" min="1" step="1" value={targetUnits} onChange={(event) => setTargetUnits(event.target.value)} /><span>units (kWh)</span></div>
            </div>
            <button type="button" className="primary-button big-button" onClick={handleOptimize}>Create my action plan <span>→</span></button>
            {plan && (
              <div className="plan-box">
                <div className="plan-summary"><strong>{formatRupees(plan.plannedMonthlyUnits * effectiveTariffRate)} estimated savings/month</strong><span>{plan.plannedMonthlyUnits.toFixed(1)} units planned toward your {plan.targetMonthlyUnits} unit goal. {plan.summary}</span></div>
                <div className="plan-section"><h3>Protected essentials</h3>{plan.protectedItems.length > 0 ? <ul>{plan.protectedItems.map((item) => <li key={item.id}>{item.name}</li>)}</ul> : <p>No essential loads marked.</p>}</div>
                <div className="plan-section"><h3>Suggested actions</h3>{plan.actions.length > 0 ? <ul className="action-list">{plan.actions.map((action) => <li key={action.id}><strong>{action.name}</strong><span>{action.recommendation} Saves {action.reductionKwh.toFixed(2)} kWh/day.</span><small>{action.habit}</small></li>)}</ul> : <p>No practical savings identified without reducing essential loads.</p>}</div>
              </div>
            )}
          </aside>
        </div>
        <footer className="dashboard-footer"><span>BijliBachat</span><span>Estimates use your appliance details · 30-day month</span></footer>
      </main>
    </div>
  )
}

export default App
