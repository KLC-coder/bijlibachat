import { useMemo, useState } from 'react'
import './App.css'
import { appliancePresets } from './data/appliancePresets'
import {
  calculateDailyKwh,
  calculateMonthlyKwh,
  generateOptimizationPlan,
  isProtectedAppliance,
} from './utils/calculations'

const emptyForm = {
  name: '',
  quantity: '1',
  watts: '',
  hours: '',
  essential: false,
}

function App() {
  const [items, setItems] = useState([
    { id: 'ac', name: 'AC', quantity: 1, watts: 1500, hoursPerDay: 8, essential: false },
    { id: 'geyser', name: 'Geyser', quantity: 1, watts: 2000, hoursPerDay: 1, essential: false },
    { id: 'fan', name: 'Fan', quantity: 3, watts: 60, hoursPerDay: 12, essential: true },
    { id: 'fridge', name: 'Refrigerator', quantity: 1, watts: 150, hoursPerDay: 24, essential: true },
  ])
  const [form, setForm] = useState(emptyForm)
  const [targetUnits, setTargetUnits] = useState('50')
  const [plan, setPlan] = useState(null)

  const applianceRows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        dailyKwh: calculateDailyKwh(item.watts, item.quantity, item.hoursPerDay),
        monthlyKwh: calculateMonthlyKwh(
          calculateDailyKwh(item.watts, item.quantity, item.hoursPerDay),
        ),
      })),
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

  const addPreset = (preset) => {
    const newItem = {
      id: `${preset.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: preset.name,
      quantity: 1,
      watts: preset.watts,
      hoursPerDay: preset.hoursPerDay,
      essential: preset.essential,
    }

    setItems((current) => [...current, newItem])
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
    const hours = Number(form.hours)

    if (!form.name || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(watts) || watts <= 0 || !Number.isFinite(hours) || hours <= 0) {
      return
    }

    const nextItem = {
      id: `${form.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: form.name.trim(),
      quantity,
      watts,
      hoursPerDay: hours,
      essential: form.essential,
    }

    setItems((current) => [...current, nextItem])
    setForm(emptyForm)
  }

  const handleToggleEssential = (itemId) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, essential: !item.essential } : item,
      ),
    )
  }

  const handleOptimize = () => {
    const nextPlan = generateOptimizationPlan(applianceRows, Number(targetUnits) || 0)
    setPlan(nextPlan)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">⚡</div>
          <div>
            <div className="brand-name">BijliBachat</div>
            <div className="brand-tag">Smart home energy planner</div>
          </div>
        </div>
        <p className="topbar-copy">Calculate your usage. Manage your electricity.</p>
      </header>

      <main className="dashboard">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Smart home electricity load & bill optimizer</p>
            <h1>Calculate your usage. Manage your electricity.</h1>
            <p className="lead">
              Track every appliance, see your total load in kWh, and create an action plan that
              protects your essentials while cutting waste where it matters most.
            </p>

            <div className="hero-stats">
              <div className="stat-box">
                <span className="stat-label">Daily load</span>
                <strong>{totals.dailyTotal.toFixed(2)} kWh</strong>
              </div>
              <div className="stat-box">
                <span className="stat-label">Monthly load</span>
                <strong>{totals.monthlyTotal.toFixed(1)} kWh</strong>
              </div>
              <div className="stat-box accent-box">
                <span className="stat-label">Protected</span>
                <strong>{totals.protectedItems.length} essentials</strong>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-card soft-card">
              <span className="mini-label">Current appliance mix</span>
              <strong>{applianceRows.length} devices tracked</strong>
            </div>
            <div className="panel-card highlight-card">
              <span className="mini-label">Target reduction</span>
              <strong>{targetUnits || 0} units/month</strong>
            </div>
          </div>
        </section>

        <section className="controls-panel">
          <div className="section-heading-row">
            <h2>Quick add common appliances</h2>
          </div>

          <div className="quick-add-row">
            {appliancePresets.map((preset) => (
              <button
                key={`${preset.name}-${preset.watts}`}
                type="button"
                className="chip-button"
                onClick={() => addPreset(preset)}
              >
                <span>{preset.name}</span>
                <small>
                  {preset.watts}W · {preset.hoursPerDay}h/day
                </small>
              </button>
            ))}
          </div>

          <form className="custom-form" onSubmit={handleAddCustom}>
            <label>
              <span>Appliance name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Heater"
              />
            </label>
            <label>
              <span>Quantity</span>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleFormChange}
              />
            </label>
            <label>
              <span>Power (W)</span>
              <input
                type="number"
                name="watts"
                min="1"
                value={form.watts}
                onChange={handleFormChange}
                placeholder="1500"
              />
            </label>
            <label>
              <span>Daily hours</span>
              <input
                type="number"
                name="hours"
                min="0.5"
                step="0.5"
                value={form.hours}
                onChange={handleFormChange}
                placeholder="6"
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="essential"
                checked={form.essential}
                onChange={handleFormChange}
              />
              Protect as essential
            </label>
            <button type="submit" className="primary-button">
              Add
            </button>
          </form>
        </section>

        <div className="content-grid">
          <section className="panel">
            <div className="section-heading-row">
              <h2>Your appliance list</h2>
              <span>{applianceRows.length} items</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Appliance</th>
                    <th>Qty</th>
                    <th>Power</th>
                    <th>Hrs/day</th>
                    <th>Daily kWh</th>
                    <th>Monthly</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {applianceRows.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        Add appliances to estimate your household energy load.
                      </td>
                    </tr>
                  ) : (
                    applianceRows.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.watts}W</td>
                        <td>{item.hoursPerDay}h</td>
                        <td>{item.dailyKwh.toFixed(2)} kWh</td>
                        <td>{item.monthlyKwh.toFixed(1)} kWh</td>
                        <td>
                          <button
                            type="button"
                            className={`priority-toggle ${item.essential ? 'essential' : ''}`}
                            onClick={() => handleToggleEssential(item.id)}
                          >
                            {item.essential ? 'Essential' : 'Adjustable'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="panel side-panel">
            <div className="section-heading-row">
              <h2>Reduce my bill</h2>
            </div>

            <div className="target-box">
              <label htmlFor="targetUnits">Target monthly saving</label>
              <div className="target-row">
                <input
                  id="targetUnits"
                  type="number"
                  min="1"
                  step="1"
                  value={targetUnits}
                  onChange={(event) => setTargetUnits(event.target.value)}
                />
                <span>units</span>
              </div>
            </div>

            <button type="button" className="primary-button big-button" onClick={handleOptimize}>
              Reduce My Bill
            </button>

            {plan && (
              <div className="plan-box">
                <div className="plan-summary">
                  <strong>{plan.targetMonthlyUnits} units</strong>
                  <span>{plan.summary}</span>
                </div>

                <div className="plan-section">
                  <h3>Protected essentials</h3>
                  {plan.protectedItems.length > 0 ? (
                    <ul>
                      {plan.protectedItems.map((item) => (
                        <li key={item.id}>{item.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No essential loads marked.</p>
                  )}
                </div>

                <div className="plan-section">
                  <h3>Daily action plan</h3>
                  {plan.actions.length > 0 ? (
                    <ul className="action-list">
                      {plan.actions.map((action) => (
                        <li key={`${action.name}-${action.minutes}`}>
                          <strong>{action.name}</strong>
                          <span>
                            Reduce runtime by {action.minutes} minutes to cut {action.reductionKwh.toFixed(2)} kWh/day.
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No practical savings identified without reducing essential loads.</p>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
