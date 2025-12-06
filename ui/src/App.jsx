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

    // Carousel State
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

    // Form State
    const [driverCount, setDriverCount] = useState(1)
    const [bookingType, setBookingType] = useState("WALK_IN")
    const [startTime, setStartTime] = useState("")

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

    // --- CAROUSEL LOGIC ---
    const handleNextTrack = () => {
        setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length)
    }

    const handlePrevTrack = () => {
        setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length)
    }

    const getCardClass = (index) => {
        if (index === currentTrackIndex) return "active"

        // Calculate Previous Index (Handling loop wrapping)
        const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length
        if (index === prevIndex) return "prev"

        // Calculate Next Index (Handling loop wrapping)
        const nextIndex = (currentTrackIndex + 1) % tracks.length
        if (index === nextIndex) return "next"

        return "hidden"
    }

    const handleBookClick = (track) => {
        setSelectedTrack(track)
        setDriverCount(1)
        setBookingType("WALK_IN")
        setStartTime("")
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

    const submitBooking = (e) => {
        e.preventDefault()

        // Automatic End Time Logic (+1 Hour)
        const startDate = new Date(startTime)
        const endDate = new Date(startDate.getTime() + (60 * 60 * 1000))
        const tzOffset = endDate.getTimezoneOffset() * 60000
        const localEndDate = new Date(endDate - tzOffset).toISOString().slice(0, 16)

        const bookingData = {
            track: { id: selectedTrack.id },
            bookingType: bookingType,
            startTime: startTime,
            endTime: localEndDate,
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

    const renderContent = () => {
        // 1. OVERVIEW TAB (3D CAROUSEL)
        if (activeView === "overview") {
            if (tracks.length === 0) return <p style={{textAlign:'center', marginTop: '50px'}}>Loading fleet...</p>

            return (
                <div className="carousel-container">

                    <button className="nav-btn prev" onClick={handlePrevTrack}>‹</button>

                    {tracks.map((track, index) => (
                        <div
                            key={track.id}
                            className={`track-spotlight ${getCardClass(index)}`}
                        >
                            <div className="spotlight-image" style={{ backgroundImage: `url(${TRACK_IMAGES[track.id]})` }}>
                                <span className="badge">{track.maxKarts} Kart Fleet</span>
                            </div>

                            <div className="spotlight-body">
                                <div className="spotlight-header">
                                    <h2>{track.name}</h2>
                                    <div className="spotlight-price">£{track.walkinPrice}<small style={{fontSize:'0.7rem', color:'#94a3b8'}}>/lap</small></div>
                                </div>

                                <div className="fleet-visual">
                                    <span className="label">Live Kart Availability</span>
                                    <div className="kart-grid">
                                        {Array.from({ length: track.maxKarts }).map((_, i) => (
                                            <span key={i} className="kart-dot" title={`Kart #${i+1}`}></span>
                                        ))}
                                    </div>
                                </div>

                                <div className="spotlight-footer">
                                    <button onClick={() => handleBookClick(track)}>Select Track</button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button className="nav-btn next" onClick={handleNextTrack}>›</button>

                </div>
            )
        }

        // 2. BOOKINGS TAB
        else if (activeView === "calendar") {
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
        }

        // 3. SETTINGS TAB
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
                    <form className="drawer-content" onSubmit={submitBooking}>

                        <div className="drawer-header">
                            <h2>Book Session</h2>
                            <button type="button" className="close-btn" onClick={() => setSelectedTrack(null)}>×</button>
                        </div>

                        <div className="drawer-body">
                            <div className="track-preview-mini" style={{ backgroundImage: `url(${TRACK_IMAGES[selectedTrack.id]})` }}>
                                <div className="mini-badge">{selectedTrack.name}</div>
                            </div>

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
                                    Standard Session Duration: 1 Hour
                                </small>
                            </div>

                            {/* STARTING GRID VISUALIZER */}
                            <div className="form-group">
                                <label>Select Drivers on Grid: <span style={{color: 'white', fontWeight: 'bold'}}>{driverCount}</span></label>

                                <div className="starting-grid-container">
                                    <div className="starting-grid">
                                        {Array.from({ length: Math.ceil(selectedTrack.maxKarts / 2) }).map((_, rowIndex) => {
                                            const posLeft = (rowIndex * 2) + 1;
                                            const posRight = (rowIndex * 2) + 2;

                                            return (
                                                <div key={rowIndex} className="grid-row">
                                                    {posLeft <= selectedTrack.maxKarts && (
                                                        <div className={`grid-slot ${driverCount >= posLeft ? 'filled' : ''}`} onClick={() => setDriverCount(posLeft)}>
                                                            <span>P{posLeft}</span>
                                                        </div>
                                                    )}
                                                    {posRight <= selectedTrack.maxKarts && (
                                                        <div className={`grid-slot ${driverCount >= posRight ? 'filled' : ''}`} onClick={() => setDriverCount(posRight)}>
                                                            <span>P{posRight}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        }).reverse()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="drawer-footer">
                            <div className="total-box">
                                <span>Total:</span>
                                <span className="total-price">
                  £{(bookingType === 'PRIVATE' ? selectedTrack.privateHourlyRatePp : selectedTrack.walkinPrice) * driverCount}
                </span>
                            </div>
                            <button type="submit" className="confirm-btn">Confirm & Pay</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default App