import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
    const [tracks, setTracks] = useState([])
    const [selectedTrack, setSelectedTrack] = useState(null) // Which track is clicked?

    // Form State
    const [driverCount, setDriverCount] = useState(1)
    const [bookingType, setBookingType] = useState("WALK_IN")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")

    useEffect(() => {
        fetchTracks()
    }, [])

    const fetchTracks = () => {
        axios.get('http://localhost:8080/api/tracks')
            .then(response => setTracks(response.data))
            .catch(error => console.error("Error:", error))
    }

    const handleBookClick = (track) => {
        setSelectedTrack(track)
        // Reset form defaults
        setDriverCount(1)
        setBookingType("WALK_IN")
    }

    const submitBooking = (e) => {
        e.preventDefault() // Stop page reload

        // Create the JSON object exactly how Java expects it
        const bookingData = {
            track: { id: selectedTrack.id },
            bookingType: bookingType,
            startTime: startTime, // datetime-local string (e.g. "2025-06-14T10:00")
            endTime: endTime,
            driverCount: parseInt(driverCount),
            totalPrice: 50.00, // Hardcoded for MVP
            status: "CONFIRMED"
        }

        axios.post('http://localhost:8080/api/bookings', bookingData)
            .then(response => {
                alert("Booking Successful! ID: " + response.data.id)
                setSelectedTrack(null) // Close the form
            })
            .catch(error => {
                // If Java throws an error (like "Sacred Time"), we catch it here
                alert("Booking Failed: " + (error.response?.data || error.message))
            })
    }

    return (
        <div className="container">
            <h1>Apex Racing Manager</h1>

            {/* 1. THE TRACK LIST */}
            <div className="track-list">
                {tracks.map(track => (
                    <div key={track.id} className="track-card" style={{ border: '1px solid #ccc', padding: '15px', margin: '10px' }}>
                        <h2>{track.name}</h2>
                        <p><strong>Max Karts:</strong> {track.maxKarts}</p>
                        <button onClick={() => handleBookClick(track)}>Book This Track</button>
                    </div>
                ))}
            </div>

            {/* 2. THE BOOKING FORM POPUP */}
            {selectedTrack && (
                <div className="booking-form" style={{ marginTop: '20px', borderTop: '2px solid black', padding: '20px' }}>
                    <h3>Booking {selectedTrack.name}</h3>
                    <form onSubmit={submitBooking}>

                        <label>
                            Type:
                            <select value={bookingType} onChange={e => setBookingType(e.target.value)}>
                                <option value="WALK_IN">Public Walk-In</option>
                                <option value="PRIVATE">Private Event</option>
                            </select>
                        </label>
                        <br /><br />

                        <label>
                            Start Time:
                            <input type="datetime-local" required onChange={e => setStartTime(e.target.value)} />
                        </label>
                        <br /><br />

                        <label>
                            End Time:
                            <input type="datetime-local" required onChange={e => setEndTime(e.target.value)} />
                        </label>
                        <br /><br />

                        <label>
                            Drivers:
                            <input type="number" min="1" max={selectedTrack.maxKarts} value={driverCount} onChange={e => setDriverCount(e.target.value)} />
                        </label>
                        <br /><br />

                        <button type="submit" style={{ backgroundColor: 'green', color: 'white' }}>Confirm Booking</button>
                        <button type="button" onClick={() => setSelectedTrack(null)} style={{ marginLeft: '10px' }}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default App