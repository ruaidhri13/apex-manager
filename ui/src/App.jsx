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
    const [bookings, setBookings] = useState([]) // New State for Bookings
    const [selectedTrack, setSelectedTrack] = useState(null)

    // Booking Form State
    const [driverCount, setDriverCount] = useState(1)
    const [bookingType, setBookingType] = useState("WALK_IN")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")

    // Initial Load
    useEffect(() => {
        fetchTracks()
    }, [])

    // Smart Fetching: Only fetch bookings when we look at the calendar
    useEffect(() => {
        if (activeView === "calendar") {
            fetchBookings()
        }
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

    // --- ACTIONS ---

    const handleUpdatePrice = (trackId, newPrice, type) => {
        // Find the track to get its current values
        const track = tracks.find(t => t.id === trackId)
        const updatedTrack = { ...track }

        if (type === 'walkin') updatedTrack.walkinPrice = newPrice
        if (type === 'private') updatedTrack.privateHourlyRatePp = newPrice

        // Call API to save
        axios.put(`http://localhost:8080/api/tracks/${trackId}`, updatedTrack)
            .then(() => {
                alert("Price Updated Successfully")
                fetchTracks() // Refresh data
            })
            .catch(err => alert("Update failed"))
    }

    const submitBooking = (e) => {
        e.preventDefault()
        const bookingData = {
            track: { id: selectedTrack.id },
            bookingType: bookingType,
            startTime: startTime,
            endTime: endTime,
            driverCount: parseInt(driverCount),
            totalPrice: 50.00,
            status: "CONFIRMED"
        }

        axios.post('http://localhost:8080/api/bookings', bookingData)
            .then(response => {
                alert("Booking Successful! ID: " + response.data.id)
                setSelectedTrack(null)
                // If we are on calendar view, refresh it
                if (activeView === "calendar") fetchBookings()
            })
            .catch(error => {
                alert("Booking Failed: " + (error.response?.data || error.message))
            })
    }

    // --- VIEW RENDERING ---

    const renderContent = () => {
        // 1. OVERVIEW TAB
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
                                <button onClick={() => { setSelectedTrack(track); setDriverCount(1); }}>Book Track</button>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        // 2. BOOKINGS TAB (Real Data Table)
        else if (activeView === "calendar") {
            return (
                <div className="table-container">
                    <table className="booking-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Track</th>
                            <th>Type</th>
                            <th>Start Time</th>
                            <th>Drivers</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookings.map(b => (
                            <tr key={b.id}>
                                <td>#{b.id}</td>
                                <td>{b.track.name}</td>
                                <td><span className={`status-badge ${b.bookingType}`}>{b.bookingType}</span></td>
                                <td>{new Date(b.startTime).toLocaleString()}</td>
                                <td>{b.driverCount}</td>
                                <td>{b.status}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {bookings.length === 0 && <p style={{textAlign: 'center', marginTop: '20px'}}>No bookings found.</p>}
                </div>
            )
        }

        // 3. SETTINGS TAB (Price Manager)
        else if (activeView === "settings") {
            return (
                <div className="settings-panel">
                    <h2>⚙️ Pricing Manager</h2>
                    <div className="settings-grid">
                        {tracks.map(track => (
                            <div key={track.id} className="setting-card">
                                <h3>{track.name}</h3>
                                <div className="setting-row">
                                    <label>Walk-in Price (£)</label>
                                    <input
                                        type="number"
                                        defaultValue={track.walkinPrice}
                                        onBlur={(e) => handleUpdatePrice(track.id, e.target.value, 'walkin')}
                                    />
                                </div>
                                <div className="setting-row">
                                    <label>Private Rate (£/pp)</label>
                                    <input
                                        type="number"
                                        defaultValue={track.privateHourlyRatePp}
                                        onBlur={(e) => handleUpdatePrice(track.id, e.target.value, 'private')}
                                    />
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

            {/* MODAL FORM */}
            {selectedTrack && (
                <div className="modal-overlay">
                    <div className="booking-form">
                        <div className="form-header">
                            <h3>Book {selectedTrack.name}</h3>
                            <button className="close-x" onClick={() => setSelectedTrack(null)}>×</button>
                        </div>
                        <form onSubmit={submitBooking}>
                            <div className="form-group">
                                <label>Event Type</label>
                                <select value={bookingType} onChange={e => setBookingType(e.target.value)}>
                                    <option value="WALK_IN">Public Walk-In</option>
                                    <option value="PRIVATE">Private Event</option>
                                </select>
                            </div>
                            <div className="row">
                                <div className="form-group">
                                    <label>Start</label>
                                    <input type="datetime-local" required onChange={e => setStartTime(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>End</label>
                                    <input type="datetime-local" required onChange={e => setEndTime(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Drivers ({driverCount})</label>
                                <input type="range" min="1" max={selectedTrack.maxKarts} value={driverCount} onChange={e => setDriverCount(e.target.value)} />
                            </div>
                            <div className="form-actions">
                                <button type="submit">Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App