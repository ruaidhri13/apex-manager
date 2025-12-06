import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const TRACK_IMAGES = {
    1: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1000&auto=format&fit=crop",
    2: "https://images.unsplash.com/photo-1511994714008-b6d68a8b32a2?q=80&w=1000&auto=format&fit=crop",
    3: "https://images.unsplash.com/photo-1596568288590-b186b51c3859?q=80&w=1000&auto=format&fit=crop"
}

function App() {
    const [activeView, setActiveView] = useState("overview")
    const [tracks, setTracks] = useState([])
    const [bookings, setBookings] = useState([])
    const [selectedTrack, setSelectedTrack] = useState(null)

    // Form State
    const [driverCount, setDriverCount] = useState(1)
    const [bookingType, setBookingType] = useState("WALK_IN")
    const [startTime, setStartTime] = useState("")
    // REMOVED: endTime state (we calculate it automatically)

    useEffect(() => {
        fetchTracks()
    }, [])

    useEffect(() => {
        if (activeView === "calendar") fetchBookings()
    }, [activeView])

    const fetchTracks = () => {
        axios.get('http://localhost:8080/api/tracks')
            .then(response => setTracks(response.data))
            .catch(error => console.error("Error:", error))
    }

    const fetchBookings = () => {
        axios.get('http://localhost:8080/api/bookings')
            .then(response => setBookings(response.data))
            .catch(error => console.error("Error fetching bookings:", error))
    }

    const handleBookClick = (track) => {
        setSelectedTrack(track)
        setDriverCount(1)
        setBookingType("WALK_IN")
        setStartTime("") // Reset time
    }

    const submitBooking = (e) => {
        e.preventDefault()

        // --- AUTOMATIC END TIME LOGIC ---
        // 1. Create a Date object from the user's start time
        const startDate = new Date(startTime)
        // 2. Add 1 Hour (60 minutes * 60 seconds * 1000 ms)
        const endDate = new Date(startDate.getTime() + (60 * 60 * 1000))
        // 3. Convert back to string format for Java (ISO-ish)
        // We adjust for timezone offset to keep local time correct
        const tzOffset = endDate.getTimezoneOffset() * 60000
        const localEndDate = new Date(endDate - tzOffset).toISOString().slice(0, 16)

        const bookingData = {
            track: { id: selectedTrack.id },
            bookingType: bookingType,
            startTime: startTime,
            endTime: localEndDate, // Automatically set to +1 Hour
            driverCount: parseInt(driverCount),
            totalPrice: 50.00,
            status: "CONFIRMED"
        }

        axios.post('http://localhost:8080/api/bookings', bookingData)
            .then(response => {
                alert("Booking Successful! ID: " + response.data.id)
                setSelectedTrack(null)
                if (activeView === "calendar") fetchBookings()
            })
            .catch(error => {
                alert("Booking Failed: " + (error.response?.data || error.message))
            })
    }

    const handleUpdatePrice = (trackId, newPrice, type) => {
        const track = tracks.find(t => t.id === trackId)
        const updatedTrack = { ...track }
        if (type === 'walkin') updatedTrack.walkinPrice = newPrice
        if (type === 'private') updatedTrack.privateHourlyRatePp = newPrice

        axios.put(`http://localhost:8080/api/tracks/${trackId}`, updatedTrack)
            .then(() => fetchTracks())
            .catch(err => alert("Update failed"))
    }

    const renderContent = () => {
        if (activeView === "overview") {
            return (
                <div className="track-grid">
                    {tracks.map(track => (
                        <div key={track.id} className="track-card">
                            <div className="card-image" style={{ backgroundImage: `url(${TRACK_IMAGES[track.id]})` }}>
                                <span className="badge">{track.maxKarts} Kart Fleet</span>
                            </div>
                            <div className="card-body">
                                <div className="card-header">
                                    <h2>{track.name}</h2>
                                    <span className="price">£{track.walkinPrice}<small>/lap</small></span>
                                </div>
                                <div className="fleet-visual">
                                    <span className="label">Live Fleet Status</span>
                                    <div className="kart-grid">
                                        {Array.from({ length: track.maxKarts }).map((_, i) => (
                                            <span key={i} className="kart-dot" title={`Kart #${i+1}`}></span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => handleBookClick(track)}>Book Track</button>
                            </div>
                        </div>
                    ))}
                </div>
            )
        } else if (activeView === "calendar") {
            return (
                <div className="table-container">
                    <table className="booking-table">
                        <thead>
                        <tr>
                            <th>ID</th><th>Track</th><th>Type</th><th>Start Time</th><th>Drivers</th><th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookings.map(b => (
                            <tr key={b.id}>
                                <td>#{b.id}</td><td>{b.track.name}</td>
                                <td><span className={`status-badge ${b.bookingType}`}>{b.bookingType}</span></td>
                                <td>{new Date(b.startTime).toLocaleString()}</td>
                                <td>{b.driverCount}</td><td>{b.status}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {bookings.length === 0 && <p style={{textAlign: 'center', marginTop: '20px'}}>No bookings found.</p>}
                </div>
            )
        } else if (activeView === "settings") {
            return (
                <div className="settings-panel">
                    <h2>⚙️ Pricing Manager</h2>
                    <div className="settings-grid">
                        {tracks.map(track => (
                            <div key={track.id} className="setting-card">
                                <h3>{track.name}</h3>
                                <div className="setting-row">
                                    <label>Walk-in Price (£)</label>
                                    <input type="number" defaultValue={track.walkinPrice} onBlur={(e) => handleUpdatePrice(track.id, e.target.value, 'walkin')} />
                                </div>
                                <div className="setting-row">
                                    <label>Private Rate (£/pp)</label>
                                    <input type="number" defaultValue={track.privateHourlyRatePp} onBlur={(e) => handleUpdatePrice(track.id, e.target.value, 'private')} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <div className="logo">🏎️ ApexManager</div>
                <nav>
                    <button className={activeView === "overview" ? "active" : ""} onClick={() => setActiveView("overview")}>🏁 Track Overview</button>
                    <button className={activeView === "calendar" ? "active" : ""} onClick={() => setActiveView("calendar")}>📅 Bookings</button>
                    <button className={activeView === "settings" ? "active" : ""} onClick={() => setActiveView("settings")}>⚙️ Settings</button>
                </nav>
            </aside>

            <main className="main-content">
                <header>
                    <h1>{activeView === "overview" ? "Facility Status" : activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h1>
                    <button className="refresh-btn" onClick={() => window.location.reload()}>↻ Refresh System</button>
                </header>

                {renderContent()}
            </main>

            {/* SIDE DRAWER (SLIDING PANEL) */}
            <div className={`drawer-overlay ${selectedTrack ? 'open' : ''}`} onClick={() => setSelectedTrack(null)}></div>

            <div className={`drawer-panel ${selectedTrack ? 'open' : ''}`}>
                {selectedTrack && (
                    <div className="drawer-content">
                        <div className="drawer-header">
                            <h2>Book Session</h2>
                            <button className="close-btn" onClick={() => setSelectedTrack(null)}>×</button>
                        </div>

                        <div className="track-preview-mini" style={{ backgroundImage: `url(${TRACK_IMAGES[selectedTrack.id]})` }}>
                            <div className="mini-badge">{selectedTrack.name}</div>
                        </div>

                        <form onSubmit={submitBooking}>
                            <div className="form-group">
                                <label>Event Type</label>
                                <select value={bookingType} onChange={e => setBookingType(e.target.value)}>
                                    <option value="WALK_IN">Public Walk-In (£{selectedTrack.walkinPrice})</option>
                                    <option value="PRIVATE">Private Event (£{selectedTrack.privateHourlyRatePp}/pp)</option>
                                </select>
                                <small style={{color: '#94a3b8', display: 'block', marginTop: '5px'}}>
                                    {bookingType === 'PRIVATE' ? 'Exclusive track access. Min 8 drivers.' : 'Shared track access.'}
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Session Start Time</label>
                                <input type="datetime-local" required onChange={e => setStartTime(e.target.value)} />
                                <small style={{color: '#94a3b8', display: 'block', marginTop: '5px'}}>
                                    Duration: 1 Hour (Standard Session)
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Number of Drivers: <span style={{color: 'white', fontWeight: 'bold'}}>{driverCount}</span></label>
                                <input
                                    type="range" min="1" max={selectedTrack.maxKarts}
                                    value={driverCount} onChange={e => setDriverCount(e.target.value)}
                                />
                                <div style={{display:'flex', justifyContent:'space-between', color: '#64748b', fontSize: '0.8rem'}}>
                                    <span>1</span>
                                    <span>{selectedTrack.maxKarts} (Max)</span>
                                </div>
                            </div>

                            <div className="total-box">
                                <span>Estimated Total:</span>
                                <span className="total-price">
                  £{(bookingType === 'PRIVATE' ? selectedTrack.privateHourlyRatePp : selectedTrack.walkinPrice) * driverCount}
                </span>
                            </div>

                            <button type="submit" className="confirm-btn">Confirm & Pay</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App